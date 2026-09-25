# no more async

<!-- Editable draft. Diagram markers preserve their placement for the later Svelte update. -->

I’ve been moving async out of the important parts of my code.

The parts that matter are usually owners of some kind of state.

I want to feed a message and let it finish a step without having to wait on something else.

with this model, an async call can just be some bytes on a buffer that you
decide to pull off and interpret

<!-- Animated diagram: two runs of the same request, with the reply arriving before or after the timeout. Component: src/lib/NetworkTiming.svelte. -->

*reponse timestamp is a mutable input here !*

A producer/consumer boundary gives me a different way to organize stacked async
calls.

I/O completions arrive as messages in an inbox (memory buffer).

a consumer then leaves outgoing work in that outbox.

a network worker can still use async and is never allowed to change the consumer’s state directly.

![Program logic sends requests through a queue to an I/O worker; replies and errors return through another queue.](static/diagrams/message-boundary.svg)

[Sans I/O](https://sans-io.readthedocs.io/how-to-sans-io.html) applies this separation to protocol code. The state stays in an ordinary Rust struct.

the methods run until completion before the caller (consumer) is allowed to deliver the next input

For example, the retry step for one pending request might look something like this:

```rust
fn tick(&mut self, now: Duration) -> Option<Action> {
    if now < self.retry_at {
        return None;
    }

    self.retry_at = now + self.retry_interval;
    Some(Action::Send { request_id: self.id })
}
```

`tick` updates the deadline and returns a send request for the caller
to execute.

The caller can resolve the request ID to bytes in a buffer pool and pass them to the I/O worker.

Now if i want to test the retry path, I can supply the deadline as `now` and inspect the returned action without opening a socket or starting a runtime.

The queues don’t quite make the system completely deterministic.

Workers can still race to enqueue messages.

Replaying the core requires reading the content + delivery order. But now the same protocol can run against a simulator w/o having to depend on state such as the CPU clock. This can just be virtualized using tokio- so u can run 80-100x the tests in the same timeframe as a side benefit of this design.

![A real I/O worker or a simulator feeds the same inbox and the same program logic.](static/diagrams/controlled-inputs.svg)

The simulator can leave this request unanswered, advance to `retry_at`,
and call `tick`. It can also deliver a reply just before the deadline
to test whether that prevents a retry. Neither case has to wait out the timeout.
A fuzzer can vary these event histories and save one that breaks an invariant.

Writing more code with agents has made this more useful to me. I can give an agent
the initial state and the history that failed, then let it work against that case.
I can also change an event or its timing to check the explanation it gives me.
