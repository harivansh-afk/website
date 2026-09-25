# deterministic state machines

I’ve been moving more of my code into deterministic state machines. I want to reproduce a component’s state changes from its initial state and the inputs it received. The difficulty is that <mark>a function’s arguments often aren’t all of its inputs.</mark> It might also read the clock, receive data from a socket, or fetch some state through an RPC.

Consider a request we want to retry after ten seconds if we’re still waiting for a reply. Whether it needs another attempt depends on the current time and whether a reply has already been processed. If the request code manages the socket and timer itself, reproducing that decision means controlling both operations. A reply that arrived after the timeout on one run might arrive before it on the next.

I separate the retry logic from those operations by having the caller supply the time and any replies. The request updates its state and returns actions, such as sending another attempt or reporting completion. <mark>The caller performs the I/O; the request owns its state.</mark> The socket code can still use async, while each method on the request finishes before the next input is delivered. This is the [Sans I/O](https://sans-io.readthedocs.io/how-to-sans-io.html) pattern used in protocol libraries.

<figure>
  <div class="diagram-scroll" tabindex="0" role="region" aria-label="I/O and request state">
    <picture>
      <source media="(max-width: 640px)" srcset="/diagrams/request-boundary-mobile.svg" width="360" height="480" />
      <img src="/diagrams/request-boundary.svg" width="760" height="330" alt="The caller reads the clock and socket, then calls tick(now) or on_reply(). Request owns its state and returns Send or Complete actions for the caller to perform." />
    </picture>
  </div>
  <figcaption>Time and replies enter through method calls. Returned actions tell the caller what work to perform.</figcaption>
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

For a pending request, a call to `tick` at or after the deadline advances the deadline and returns `Send`. The caller sends the request and routes replies to `on_reply`, which returns `Complete` for the first reply and no action for later ones. This prevents duplicate completion locally; handling retries safely on the server requires deduplication or an idempotent operation.

Payloads, send failures, and cancellation are omitted here. Where they affect a state transition, they need to be supplied as inputs too.

## Event ordering

A test can deliver the reply before checking the deadline, or call `tick` at the deadline before delivering the reply. Both cases exercise the same implementation without opening a socket or waiting for a timeout.

<figure>
  <div class="diagram-scroll" tabindex="0" role="region" aria-label="Reply and timeout delivery orders">
    <picture>
      <source media="(max-width: 640px)" srcset="/diagrams/retry-order-mobile.svg" width="360" height="648" />
      <img src="/diagrams/retry-order.svg" width="760" height="380" alt="Both histories start with request 7 pending. Reply then tick at ten seconds returns Complete then no action. Tick at ten seconds then reply returns Send then Complete. Both complete once, but only the second ordering requests a retry." />
    </picture>
  </div>
  <figcaption>The same initial state, with two input orders. Only the second ordering returns a Send action.</figcaption>
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

What matters is <mark>the order in which the request handles the inputs.</mark> A reply might already be in the socket buffer when the caller delivers the timeout. The request still asks for a retry because it hasn’t processed that reply yet.

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

We can record inputs as events and replay them through the same methods. The record needs the <mark>initial state, input values, delivery order, and code version.</mark> Random choices and reads from shared state must also be controlled. Logging that an RPC happened is insufficient; we need the result the component received.

Replay lets us inspect the state and returned actions after each input. We can run the failing history against a change and check those actions without sending requests to the real server.

## Simulation testing

A simulator can generate histories we haven’t observed: a reply after several retries, repeated replies, or no reply at all. After each event it checks a property such as “a request completes at most once,” saving any history that breaks it. It reaches a deadline by <mark>advancing a value instead of waiting for time to pass.</mark>

Generated histories must respect the system being modeled: a monotonic clock cannot move backwards, and a reply needs a request that could have produced it. The [complete example](https://play.rust-lang.org/) checks histories up to six events long and can be run in Rust Playground. A request that never completes would pass the duplicate-completion check, so the ordering tests also require the first reply to return `Complete`.

[FoundationDB](https://apple.github.io/foundationdb/testing.html) and [TigerBeetle](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md) use deterministic simulation to explore failures across networks, clocks, and storage. Simulation covers the failures represented by its model; the real I/O code still needs testing.

Writing more code with agents is one reason I want reproducible failures. I can hand an agent the initial state, input history, and failed assertion, then check its changes against the same case.
