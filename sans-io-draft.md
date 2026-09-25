# deterministic state machines

I’ve been moving more of my code into deterministic state machines. I want to reproduce a component’s state changes from its initial state and the inputs it received. The difficulty is that <mark>a function’s arguments often aren’t all of its inputs.</mark> It might also read the clock, receive data from a socket, or fetch some state through an RPC.

Consider a request we want to retry after ten seconds if we’re still waiting for a reply. Whether it needs another attempt depends on the current time and whether a reply has already been processed. If the request code manages the socket and timer itself, reproducing that decision means controlling both operations. A reply that arrived after the timeout on one run might arrive before it on the next.

I separate the retry logic from those operations by having the caller supply the time and any replies. The request keeps its deadline and completion flag, so it can decide whether another attempt is due. <mark>If it needs to retry, it returns a <code>Send</code> action and the caller sends the request.</mark> The caller can use async to wait for the socket, while the request’s methods finish updating its fields before the next input is handled. This is the [Sans I/O](https://sans-io.readthedocs.io/how-to-sans-io.html) pattern used in protocol libraries.

<figure>
  <div class="diagram-scroll" tabindex="0" role="region" aria-label="I/O and request state">
    <picture>
      <source media="(max-width: 640px)" srcset="/diagrams/request-boundary-mobile.svg" width="360" height="480" />
      <img src="/diagrams/request-boundary.svg" width="760" height="330" alt="The caller reads the clock and socket, then calls tick(now) or on_reply(). Request owns its state and returns Send or Complete actions for the caller to perform." />
    </picture>
  </div>
  <figcaption>If <code>tick(now)</code> returns <code>Send</code>, the caller sends the request. When a reply arrives, it calls <code>on_reply()</code>.</figcaption>
</figure>

## State transitions

Assume request 7 was sent at time zero, with its first retry due at ten seconds. Its `Request` struct holds the ID, a `done` flag, a `retry_at` deadline, and a ten-second `retry_interval`. Time is a `Duration` measured from that origin.

```rust region=handlers
impl Request {
    fn tick(&mut self, now: Duration) -> Option<Action> {
        if self.done || now < self.retry_at {
            return None;
        }

        self.retry_at = now + self.retry_interval;
        Some(Action::Send {
            request_id: self.id,
        })
    }

    fn on_reply(&mut self) -> Option<Action> {
        if self.done {
            return None;
        }

        self.done = true;
        Some(Action::Complete {
            request_id: self.id,
        })
    }
}
```

For a pending request, a call to `tick` at or after the deadline advances the deadline and returns `Send`. The caller sends the request and routes replies to `on_reply`, which returns `Complete` for the first reply and no action for later ones. The `done` flag stops this client from reporting completion twice. The server could still execute both attempts, so it needs to recognize a request ID it has already handled or use an operation whose effect is the same when repeated.

If a failed socket write should change the retry deadline, the caller would pass that error back through another method. The request could then update its deadline without making the write itself.

## Event ordering

A test can deliver the reply before checking the deadline, or call `tick` at the deadline before delivering the reply. Both cases exercise the same implementation without opening a socket or waiting for a timeout.

<figure>
  <div class="diagram-scroll" tabindex="0" role="region" aria-label="Reply and timeout delivery orders">
    <picture>
      <source media="(max-width: 640px)" srcset="/diagrams/retry-order-mobile.svg" width="360" height="648" />
      <img src="/diagrams/retry-order.svg" width="760" height="380" alt="Both histories start with request 7 pending. Reply then tick at ten seconds returns Complete then no action. Tick at ten seconds then reply returns Send then Complete. Both complete once, but only the second ordering requests a retry." />
    </picture>
  </div>
  <figcaption>Processing the reply before <code>tick(10s)</code> prevents a <code>Send</code> action.</figcaption>
</figure>

Here, `pending_request()` constructs that initial state, with the first retry due at ten seconds.

```rust region=orderings
#[test]
fn reply_before_timeout() {
    let mut request = pending_request();

    assert_eq!(request.on_reply(), Some(Action::Complete { request_id: 7 }));
    assert_eq!(request.tick(Duration::from_secs(10)), None);
}

#[test]
fn timeout_before_reply() {
    let mut request = pending_request();

    assert_eq!(
        request.tick(Duration::from_secs(10)),
        Some(Action::Send { request_id: 7 })
    );
    assert_eq!(request.on_reply(), Some(Action::Complete { request_id: 7 }));
}
```

The first reply might already be in the socket buffer when the caller runs `tick`. Because `on_reply` hasn’t processed it, `done` is still false and a call at the deadline returns `Send`. <mark>Calling <code>on_reply</code> first would set <code>done</code> and prevent that retry.</mark>

## Replay

The tests above each deliver one reply. If we forgot the `done` check in `on_reply`, both would still pass. A timeout followed by two replies exposes the mistake: the request returns `Complete` twice.

```rust region=duplicate
#[test]
fn duplicate_reply_does_not_complete_twice() {
    let mut request = pending_request();

    request.tick(Duration::from_secs(10));
    request.on_reply();
    assert_eq!(request.on_reply(), None);
}
```

For this failure, the history is `Tick(10s), Reply, Reply`. Replaying it requires the <mark>initial state, input values, delivery order, and code version.</mark> For randomized retries, we can record the chosen delay so a replay doesn’t choose a different deadline. For an RPC, we need the result the component received, not just a record that the call happened.

Stepping through that history shows `done` becoming true on the first reply. A second `Complete` action would expose the bug even though `done` stays true. After changing the code, we can rerun the same calls and inspect their results without sending requests to the server.

## Simulation testing

A simulation can try a reply after several retries, two replies in a row, or a run with no reply at all. After each input it checks whether the request has completed more than once and saves the sequence if it has. A ten-second timeout can be tested by <mark>passing that time to <code>tick</code></mark>, without sleeping.

The [complete example](https://play.rust-lang.org/) starts with a pending request and tries sequences of replies and time updates, up to six inputs, without moving the clock backwards. A request that never completes would pass the duplicate-completion check, so the ordering tests also require the first reply to return `Complete`.

These tests would still pass if the socket-reading code dropped every reply: they call `on_reply` directly. To test that path, we need to send a request through the socket and check that its reply reaches the state machine.

[FoundationDB](https://apple.github.io/foundationdb/testing.html) and [TigerBeetle](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md) test database clusters with simulators that can delay messages, fail storage operations, and repeat the same sequence of faults.

If I ask an agent to fix the duplicate-reply bug, I can give it the three calls above and the failing assertion. It can change `on_reply`, rerun the sequence, and check whether the second reply still completes the request.
