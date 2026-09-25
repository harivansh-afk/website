# deterministic state machines

I’ve been moving more of my code into deterministic state machines. I want to be able to take a component’s initial state and the inputs it received, then run it again and reproduce the same state changes. The difficulty is that <mark>a function’s arguments often aren’t all of its inputs.</mark> It might also read the clock, receive data from a socket, or fetch some state through an RPC.

Consider a request that should be retried if no reply arrives before a deadline. Whether it needs another attempt depends on the current time and whether a reply has already been processed. If the request code manages the socket and timer itself, reproducing that decision means controlling both operations. A reply that arrived after the timeout on one run might arrive before it on the next.

I separate the retry logic from those operations by having the caller supply the time and any replies. The request updates its state and returns actions, such as sending another attempt or reporting completion. <mark>The caller performs the I/O; the request owns its state.</mark> The socket code can still use async, while each method on the request finishes before the next input is delivered.

<figure>
  <div class="diagram-scroll" tabindex="0" role="region" aria-label="I/O and request state">
    <picture>
      <source media="(max-width: 640px)" srcset="/diagrams/request-boundary-mobile.svg" width="360" height="480" />
      <img src="/diagrams/request-boundary.svg" width="760" height="330" alt="The caller reads the clock and socket, then calls tick(now) or on_reply(). Request owns its state and returns Send or Complete actions for the caller to perform." />
    </picture>
  </div>
  <figcaption>Time and replies enter through method calls. Returned actions tell the caller what work to perform.</figcaption>
</figure>

This is the [Sans I/O](https://sans-io.readthedocs.io/how-to-sans-io.html) pattern used in protocol libraries. The implementation works with data passed to it, so the same code can run against a real connection or a test supplying those inputs.

## State transitions

Assume request 7 has already been sent at time zero. Its `Request` struct holds the ID, a `done` flag, a `retry_at` deadline, and a ten-second `retry_interval`. Time is a `Duration` from a fixed origin.

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

When the deadline is reached, `tick` schedules the next retry and returns `Send`. The caller resolves the request ID to its bytes and sends them. It also routes incoming replies to `on_reply`, where the first reply completes the request and later replies return no action. This prevents duplicate completion locally; avoiding duplicate execution on the server requires deduplication or an idempotent operation.

Payloads, send failures, and cancellation are omitted here. Where they affect a state transition, they need to be supplied as inputs too.

## Event ordering

A test can deliver the reply before checking the deadline, or let the deadline expire first. Both cases exercise the same implementation without opening a socket or waiting for a timeout.

<figure>
  <div class="diagram-scroll" tabindex="0" role="region" aria-label="Reply and timeout delivery orders">
    <picture>
      <source media="(max-width: 640px)" srcset="/diagrams/retry-order-mobile.svg" width="360" height="648" />
      <img src="/diagrams/retry-order.svg" width="760" height="380" alt="Both histories start with request 7 pending. Reply then tick at ten seconds produces Complete then no action. Tick at ten seconds then reply produces Send then Complete. Both complete once, but only the second ordering retries." />
    </picture>
  </div>
  <figcaption>The same initial state, with two input orders. Only the second ordering sends a retry.</figcaption>
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

What matters is <mark>the order in which the request handles the inputs.</mark> A reply might already be in the socket buffer when the caller delivers the timeout. The request still asks for a retry because it hasn’t processed that reply yet. The tests let us examine both outcomes explicitly.

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

Without the guard, the last assertion fails every time. Restoring it turns this sequence into a regression test, without having to arrange for two real responses to arrive at the right moment.

For a larger component, we can record inputs as events and replay them. The record needs the <mark>initial state, input values, delivery order, and code version.</mark> Random choices and reads from shared state must also be controlled. Logging that an RPC happened is insufficient; we need the result the component received.

With those inputs fixed, we can reproduce the state after each event and find the first transition that violates a requirement. After changing the code, we can replay the same history to check the fix. The returned send actions can be inspected without executing them against the real server.

## Simulation testing

A simulator can generate histories we haven’t observed: a reply after several retries, repeated replies, or no reply at all. After each event it checks a property such as “a request completes at most once,” saving any history that breaks it. It reaches a deadline by <mark>advancing a value instead of waiting for time to pass.</mark>

The histories must respect the system being modeled: a monotonic clock cannot move backwards, and a reply needs a request that could have produced it. [FoundationDB](https://apple.github.io/foundationdb/testing.html) and [TigerBeetle](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md) use deterministic simulation to explore failures across networks, clocks, and storage. You can [view/run the complete example](https://play.rust-lang.org/), including a much smaller search over histories up to six events long. Neither covers failures outside its model; the real I/O code still needs testing.

Writing more code with agents has made me more interested in this structure. I can give an agent a failing history and a requirement, then have it inspect the transitions and check its changes against that case. Generating other histories helps test whether the fix also handles cases beyond the original failure.

Choosing the requirements is still engineering work. A request that never completes also satisfies “completes at most once,” so we need to check when progress is expected as well. Deterministic execution gives us a way to investigate those properties, whether an agent is making the change or we are debugging it ourselves.
