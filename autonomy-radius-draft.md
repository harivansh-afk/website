# the autonomy radius

*Adapted from my talk at the YC AI unconference, August 2026.*

At Indexable, we're a team of three maintaining a monorepo with over 1.5 million lines of Rust. We build VM infrastructure: our own hypervisor, a POSIX file system, and the replicated storage underneath it.

Agents write code throughout this stack.

And yes, there are parts of the codebase we don't read and don't understand in detail. We still need to understand what those components must guarantee and how to check those guarantees.

This takes work to make reasonable when real customers depend on it.

The code an agent produces can pass all your integration tests and still be a heap of shit to maintain. Every change leaves behind patterns the next agent will follow. Bad abstractions and hidden failures accumulate unless something keeps pushing back.

You can keep finding these things in review. But if every implementation needs you to explain what is wrong, check the fix, and interpret the result, you are still in the loop of every task. You can spend thousands on tokens and still have every task waiting on you.

Adding more agents makes that queue longer.

So a lot of our engineering time goes into building the feedback around them. When we keep making the same correction, we look for a check that can make it for us. When a feature has a difficult correctness question, we build something the agent can run to answer it. That work lets us hand over more of the development lifecycle without personally conducting every iteration.

I call that the autonomy radius: how much work an agent can carry before it needs fresh judgment from us.

## the circle is made of feedback

The compiler gives an agent a useful place to start. Write code, compile it, inspect the error, try again. The agent can complete that loop without asking you whether the code compiled.

Now ask whether a snapshot can restore a working database, or whether a storage optimization actually improved throughput. The agent needs a way to observe those things too. Reading the implementation again won't tell it what happened when the machine was restored.

This is where the environment starts to determine how much you can delegate. If the benchmark produces a page of numbers that only you know how to interpret, the task still comes back to you. If it applies a defined acceptance rule and explains a failure, the agent has something it can work against.

The feedback has to check what you care about and arrive soon enough to affect the work. A compiler error belongs inside an implementation attempt. A longer simulation run can search for failures after merge and produce the next debugging task. Both are useful, on different clocks.

Better models help. Asking a stronger model to reread the code still doesn't establish which writes survived a crash. We have to define what the protocol promises and give the agent a way to check it.

<figure>
<div class="diagram-scroll" tabindex="0" role="region" aria-label="Feedback expands the work an agent can evaluate independently.">
<img src="/diagrams/autonomy-radius.svg" width="640" height="510" alt="Feedback expands the work an agent can evaluate independently." />
</div>
<figcaption>Figure 1. A conceptual boundary, not a measurement. Each added check makes another kind of decision available to the agent.</figcaption>
</figure>

## stop writing the same review comment

Take this for example:

```rust
let port = u16::try_from(cfg.port).unwrap_or_default();
```

If the conversion fails, the program gets zero. An invalid configuration has become an apparently successful result. We wanted the error propagated while it still explained what went wrong.

That's a concrete opinion. So is wanting named fields instead of an anonymous tuple of three integers, or wanting shared queue handling instead of another copy of the same loop. Behavioral tests alone don't express all of those decisions.

We built astlog to make structural rules executable. It runs Datalog over syntax trees, which lets us relate a call to the function containing it. Finding an `unwrap` inside a function returning `Result` is a small example of the kind of rule it can express.

We also fingerprint syntax to detect copied code even when the variable names or constants change. New duplication counts against the change. The agent gets a failure it can address before another person has to point out the copy.

Once those patterns are detectable, they can become scheduled cleanup work. Our Symphony workflows have agents find a candidate, make a change, and run the applicable checks. One example was a queue-drain loop repeated across three virtio devices. The agent pulled out the shared mechanics and left the device-specific behavior in a closure.

The detector gave it somewhere to look. Choosing the abstraction was still implementation work, and the resulting change still needed validation. But the whole task could run against requirements we had already established.

These rules need maintenance too. In one case, a rule banning `mkForce` was followed by a rule catching its numeric `mkOverride` workaround. We had to close the hole in what we'd asked the checker to enforce. Each lint also gets examples it should accept and reject; a check that never fires is easy to mistake for a healthy one.

A review comment helps with the change in front of you. Encoding the correction gives the next agent the same feedback.

## make the code explain itself later

Some decisions need more than syntax. We carry a Clippy fork for checks that need the compiler's understanding of types.

One of those checks is `uninstrumented_await`. Suppose a function instruments some of its asynchronous operations but leaves another one bare. The trace accounts for part of the work. Time spent waiting on the bare operation appears as an unexplained gap.

The lint catches that partial instrumentation. If you've decided that individual awaits need spans in a function, it asks you to finish the job. It doesn't require every function in the program to have them.

<figure>
<div class="diagram-scroll" tabindex="0" role="region" aria-label="Two illustrative traces: an unexplained gap becomes a named receive-body operation.">
<img src="/diagrams/missing-span.svg" width="640" height="370" alt="Two illustrative traces: an unexplained gap becomes a named receive-body operation." />
</div>
<figcaption>Figure 2. The same illustrative operation, with and without a span around the wait. Widths are schematic, not measured timings.</figcaption>
</figure>

It needs type information because the instrumentation may happen before the await:

```rust
let future = receive_body().instrument(span);
future.await?;
```

Looking only for an instrumentation call next to `.await` would miss this. The compiler can follow the future's type through the binding.

This is one reason I think about the whole lifecycle together. A check while writing code improves the evidence available when production misbehaves. By the time someone opens the trace, it's too late to record the operation we left out.

## a harness per problem

Our hardest questions belong to the systems we're building. What may garbage collection reclaim while references are changing? Which writes must survive a crash? A generic linter has no knowledge of those contracts.

So implementing the feature also means building an instrument for it.

Our restore drill snapshots a machine running a database workload, restores it, and checks the restored machine. The agent can exercise the behavior we care about instead of stopping at code that looks like it should restore correctly.

The drain benchmark does something similar for performance. Its comparison command applies the ship rule from the design document. It compares matching workload shapes and refuses comparisons whose inputs don't belong together. A regression produces a failing process status, so the result can drive the next step in a workflow.

Writing that comparison is engineering work. You have to decide what counts as an improvement and when the measurements are usable. Once those decisions are executable, an agent can use them on the next candidate without asking you to read another report.

That is the investment: give the agent a way to evaluate the specific thing you asked it to build. Keep the harness close enough to development that it can run it, inspect the failure, and try again.

<figure>
<div class="diagram-scroll" tabindex="0" role="region" aria-label="An agent revises a candidate against a harness; failures return evidence and passing work proceeds to the next gate.">
<img src="/diagrams/harness-loop.svg" width="640" height="560" alt="An agent revises a candidate against a harness; failures return evidence and passing work proceeds to the next gate." />
</div>
<figcaption>Figure 3. The agent can iterate against an existing contract. Humans define the requirements and revise checks that fail to capture them.</figcaption>
</figure>

We use the same loop for delegated work. Workers get their own snapshot-forked VMs, where they can run the relevant checks without sending every failed attempt back to the coordinating agent. They return the candidate and its validation results. The combined change still needs validation.

## find the failures you didn't think to test

A focused harness can check a known scenario. Production combines operations in orders we didn't write down. A process dies during recovery. A journal reopens between a change to memory and a change to disk.

We use deterministic simulation to explore those executions under faults. A failing execution can be replayed, giving an investigation a particular sequence of events to explain.

One example from the talk involved our block-volume journal. In a simplified version, each write receives a sequence number. Once the journal has made records through sequence 4 durable, reopening that history must not issue sequence 0 again.

A workload that killed the writer and reopened the journal caught exactly that: an acknowledged sequence 0 with the journal already flushed through 4.

<figure>
<div class="diagram-scroll" tabindex="0" role="region" aria-label="A journal flushes through sequence 4, restarts, and incorrectly acknowledges sequence 0.">
<img src="/diagrams/journal-history.svg" width="640" height="510" alt="A journal flushes through sequence 4, restarts, and incorrectly acknowledges sequence 0." />
</div>
<figcaption>Figure 4. A simplified journal showing the recorded failure. The checker retains the durable boundary across the restart.</figcaption>
</figure>

A successful append wouldn't tell you this was wrong. The checker needed to remember history across the crash. We had to encode what the sequence numbers meant and what reopening was required to preserve.

The counterexample gives us a starting point for debugging. Replay helps establish whether the mistake is in the implementation or in the workload and assertion. We also check that the workload actually reached the hazards it was meant to exercise. A fault test that never reaches its fault can give you a very reassuring result.

These longer searches have a different job from the checks on an individual change. The scheduled runs described here feed discoveries back into development; they aren't the candidate's merge gate. Where possible, a discovered failure becomes a focused regression test the next agent can run earlier.

## give agents the running system too

When a VM operation stalls, the explanation may cross the control plane, the hypervisor, and storage. Source access lets an agent read how those components are supposed to work. It also needs evidence from the operation that stalled.

Our fleet IDE puts hosts, VMs, journal output, CI runs, and agents in one place. Agents query the same operational data underneath the interface. They can investigate without waiting for us to copy logs into a conversation.

This connects back to the tracing lint. We need to record useful evidence in the first place, then make it accessible during an investigation. Missing either end puts a person back in the loop to reconstruct what happened.

## what we still do

We choose what to build and what the system must guarantee. We decide which structural opinions are worth enforcing. When a checker accepts something it shouldn't, or rejects something reasonable, we have to improve it.

We also decide when the existing evidence is insufficient. A passing harness can establish a particular behavior while leaving an architectural question unanswered. That question still needs attention; running the same check again won't settle it.

That is how I think about maintaining this codebase with three people. The feedback we build for one task remains available to the next agent. We can spend more of our time on the questions those checks don't yet answer.

When work keeps coming back to me, I want to know which judgment it's waiting for, and whether I can give the environment a way to make it.
