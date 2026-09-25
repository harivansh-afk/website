# deterministic state machines

I’ve been moving more of my code into deterministic state machines. I want to be able to take a component’s initial state and the inputs it received, then run it again and reproduce the same state changes. The difficulty is that a function’s arguments often aren’t all of its inputs. It might also read the clock, receive data from a socket, or fetch some state through an RPC.

Consider a request that should be retried if no reply arrives before a deadline. Whether it needs another attempt depends on the current time and whether a reply has already been processed. If the request code manages the socket and timer itself, reproducing that decision means controlling both operations. A reply that arrived after the timeout on one run might arrive before it on the next.

I separate the retry logic from those operations by having the caller supply the time and any replies. The request keeps its deadline and completion status in a struct. A `tick(now)` method checks whether another attempt is due and, if so, returns a send action for the caller to perform. When a reply arrives, the caller passes it back to the request, which marks itself complete. The caller can still use async to handle the socket; the methods updating the request’s state don’t need to wait for anything.

<figure>
  <picture>
    <source media="(max-width: 640px)" srcset="/diagrams/request-boundary-mobile.svg" width="360" height="480" />
    <img src="/diagrams/request-boundary.svg" width="760" height="330" alt="The caller reads the clock and socket, then calls tick(now) or on_reply(). Request owns its state and returns Send or Complete actions for the caller to perform." />
  </picture>
  <figcaption>The caller performs I/O and passes its results to the request. Only the request’s methods change its state.</figcaption>
</figure>

This separation is the [Sans I/O](https://sans-io.readthedocs.io/how-to-sans-io.html) pattern used in protocol libraries. A parser, for example, can consume a buffer of bytes without knowing whether they came from a TCP socket, a file, or a test. The same idea applies to the rest of the protocol’s state, including outstanding requests and their deadlines.

## a retry in Rust

For this example, assume request 7 has already been sent at time zero and should be retried after ten seconds. Its `Request` struct holds the request ID, a `done` flag, the next deadline in `retry_at`, and a `retry_interval`. Time is represented as a `Duration` from a fixed origin, so a test can supply it as an ordinary value.

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

`tick` does nothing until the deadline is reached. When a retry is due, it advances the deadline and returns `Send`; constructing that value doesn’t send any bytes. The caller resolves the request ID to the bytes it needs to send and performs the write. It also matches incoming replies to their requests before calling `on_reply`.

The `done` check in `on_reply` handles an important case: both the original attempt and a retry can receive replies. The first reply completes the request, and subsequent replies return no action. This prevents duplicate completion locally; preventing the remote server from performing an operation twice requires its own deduplication or an idempotent operation.

I’ve left payloads, send failures, and cancellation out of the example. If one of those affects a state transition, the caller must supply it as an input too. Moving the socket elsewhere would accomplish little if another task could still mutate the request’s state behind its methods.

## choosing the order

A test can now create a pending request, advance time past the deadline, and check that `tick` asks for another send. Or it can deliver the reply first and check that crossing the deadline no longer causes a retry. Both tests use the same request implementation, without opening a socket or waiting for a timeout.

<figure>
  <picture>
    <source media="(max-width: 640px)" srcset="/diagrams/retry-order-mobile.svg" width="360" height="648" />
    <img src="/diagrams/retry-order.svg" width="760" height="380" alt="Both histories start with request 7 pending. Reply then tick at ten seconds produces Complete then no action. Tick at ten seconds then reply produces Send then Complete. Both complete once, but only the second ordering retries." />
  </picture>
  <figcaption>Both histories start with the same pending request. The order in which it handles the inputs determines whether it sends a retry.</figcaption>
</figure>

Here are those two cases as tests. `pending_request()` constructs the initial state described above, with a ten-second retry interval.

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

The relevant order is the order in which the request handles the inputs. A reply might already be sitting in a socket buffer when the caller delivers the timeout. In that case, the request still asks for a retry because it hasn’t processed the reply yet. The test makes that choice visible instead of depending on which operation happens to finish first during a run.

The caller also decides when to call `tick`. If it supplies twelve seconds rather than ten, this implementation sends one retry and schedules the next for twenty-two seconds. It doesn’t try to catch up by sending every attempt that might have occurred while it was idle. That is a policy we can inspect in the function and check with another test.

## keeping a failing history

Suppose we had forgotten the `done` check in `on_reply`. The two ordering tests would still pass, since each delivers only one reply. A timeout followed by two replies would expose the mistake: the request would return `Complete` twice.

```rust region=duplicate
#[test]
fn duplicate_reply_does_not_complete_twice() {
    let mut request = pending_request();

    request.tick(Duration::from_secs(10));
    request.on_reply();
    assert_eq!(request.on_reply(), None);
}
```

With the check removed, the last assertion fails every time. We don’t need to arrange for two real responses to arrive at the right moment; the test supplies the sequence directly. With the check restored, the same sequence becomes a regression test.

A larger component can record its inputs as events, such as `Tick(10s)` and `Reply { request_id: 7, body: ... }`. Replaying them requires the initial state, the input values, their delivery order, and the version of the code that handled them. Any other source of variation, such as random choices or reads from shared state, has to be controlled as well. The useful record is what the component actually received, not just a log saying that an RPC was made.

For a fixed implementation, that record lets us reproduce the state after each event and inspect the first transition that violates a requirement. After changing the implementation, we can feed it the same history and check that the requirement now holds. Replaying the request code does not require executing the returned sends against the real server again.

## searching for other failures

Once tests can supply event histories, a simulator can generate them. For the request example, it can advance time without delivering a reply, deliver a late reply after several retries, or deliver the same reply more than once. After each step it checks a property such as “a request completes at most once.” If the property fails, it saves the history so we can investigate it.

Time advances in the simulation by changing a value. To test a retry after ten seconds, the simulator supplies ten seconds; it doesn’t sleep for that long. This removes the wait from tests whose execution would otherwise be dominated by timeouts. There is still work involved in processing each event, so the benefit depends on the workload.

The generated histories need to respect the system being modeled. A simulated monotonic clock should not move backwards, and a reply needs a request that could have produced it. Within those constraints, we can explore many more cases than we would want to write out by hand. [FoundationDB’s testing documentation](https://apple.github.io/foundationdb/testing.html) and [TigerBeetle’s VOPR](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md) describe this approach at a much larger scale, with controlled networks, clocks, and storage.

The [complete Rust example](/thoughts/sans-io/example.rs) includes a small search over histories up to six events long, as well as the tests shown here. It checks for duplicate completion and actions emitted after completion. That bound makes the scope of the check explicit: passing it says nothing about histories outside the search or failures the model cannot represent. The socket code, operating system integration, and real server behavior still need their own tests.

## working on the code

Writing more code with agents has made me more interested in this structure. When an agent changes a retry path, I want it to have a failing case it can run and a requirement it can check. An initial state and a saved history give it a way to inspect what happened, test an explanation, and rerun the case after a change. Generating other histories helps check whether it has fixed the problem or only handled the one sequence it was shown.

The requirements still need judgment. “Completes at most once” would also be satisfied by a request that never completes, so it cannot be our only check. We also need to describe when progress is expected and test it under those conditions. For software where a mistake can lose data or repeat an operation, deciding which properties to check is part of the engineering work; a deterministic test only makes the result reproducible.

That is why I want more of the code to have this shape. I can examine a state transition on its own, reproduce the sequence that led to it, and change an input to test my understanding. Those are useful tools for an agent working on the code, and they are the same tools I want when I have to debug it myself.
