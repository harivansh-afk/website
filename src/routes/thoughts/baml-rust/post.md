# Compiling BAML to Rust

<!-- SPINE
Thesis: native code is the interpreter's per-operation decisions made once at compile time.
Everything else is plumbing so a compiled function is indistinguishable from bytecode to its
callers, the GC, the unwinder and telemetry.

Running example: `sum`, carried through every section and changed one step at a time
(the Bernstein weval pattern). Interpreter cost -> MIR -> loop/match Rust -> structured Rust ->
`sum` with an await inside -> `sum` holding an array across that await -> a recursive call.

Each section: what breaks -> the obvious fix -> why it fails, with one number -> what we did ->
what that costs, which is the next section. Those beats live in the prose; headings just name
the topic in plain words.

Writing rules (from hashimoto, bernstein, fallin, the boundary agents post):
- first paragraph says what we did and the number. no motivation sentence.
- show the artifact (code, number, diagram) before explaining it.
- end each section on the question the next one answers.
- every claim gets one number or a named example. say what was measured and what was argued.
- name real functions, not "A" and "B". no "simply", "pretty easily", "a mere", "quite", "!".
-->

<!-- TODO opening: what we built and the headline number, in Hari's words. -->

<!-- TODO number check: kpis-fibers (Oct 20, Spark, telemetry off), 29 workloads: geomean 2.77x, median 1.66x, max 42.4x (nested loops 500x500), and process startup is 0.6x (slower). Re-run on the merged build before publishing. -->
BAML may look like a small language from the outside, but it is extremely feature heavy and provides a lot of runtime guarantees. 

Any function can await like in Go, theres no ‘async’ keyword so any function can also pause. Telemetry (BTEL) at the default level records a span for call so you cant let LLVM inline a function out of existence. And memory is garbage collected at runtime with a stop-the-world moving GC which only runs when every task is at a safe point. 

This means we have to walk a very thin line when trying to maintain the runtime guarantees of this language in compiled form.

## Why Rust

<!-- TODO honesty: we ruled LLVM IR, C and Cranelift out by argument; we didn't benchmark them. Say so. -->

Before landing on Rust, we considered many alternatives. Since most options ended up at LLVM or something like it,  the question that decided it was what ends up sitting between our MIR and the final runtime? and how can we do the least amount of work in this middle-ground while reaping the most benefit from the final representation.

Emitting LLVM IR was a valid option. Since it takes arbitrary branches there’d be no need to rebuild structured loops. It also has state-points for moving collectors which is quite helpful. State-points dont connect to our collector and LLVM makes no promise that they will be stable across versions so every operation we expose to LLVM directly is a piece of BAML behavior we now have to own and develop internally… 

C was also tempting since it supports GOTO statements so MIR blocks are able to translate to it almost line for line. Since BAML does arithmetic a bit differently, we would have to re-implement a lot here and every generated C call would have to cross an FFI like boundary for this to work. Cranelift has the opposite problem where it compiles fast and has things like stack maps built in but it can only inline bodies in its own IR. So a Rust runtime compiled by LLVM is opaque to it and every helper call ends up staying local. 

If we take a step back, each of these options share a similar problem- each makes the runtime boundary a foreign-function-call (FFI). Rust makes a lot of this disappear. The VM is a rust program so generated code is able to allocate, read fields and throws by calling VM functions that already exist. You can also go as far as sharing the Vm’s types and with fat LTO, LLVM is able to optimize the generated code + runtime as a single unit (which is huge for farming our optimization). Rustc type-checks the output too so a wrong field index is found at compile time.

<!-- TODO handoff: the three things Rust doesn't give us: goto, a way to pause mid-stack, stack maps. Each is a section below. -->

## Control flow

<!-- TODO what `sum` costs in the interpreter: each bytecode op pays decode, tag check and stack traffic; the compiled loop keeps `i` and `total` in registers. Thesis sentence goes here. -->

MIR is an lowered representation of BAML. It lies at level 3 in the lowering order and comes after things like AST

<!-- TODO why MIR and not typed BAML (TIR). The reasons from the Oct 1 decision:
- GC rooting and evaluation order are MIR facts; TIR has no temporaries or program points
- the structurer needs a control-flow graph
- irreducible control flow only exists after lowering, so MIR is where the "Rust has no goto" objection can be answered at all
-->

MIR looks something like this :

```text sum.baml

function sum(xs: int[]) -> int {
  let total = 0;
  let i = 0;
  while (i < xs.length()) {
    total += xs[i];
    i += 1;
  }
  total
}
```

```text sum.mir

fn user.sum(xs: int[]) -> int {
    // Locals:
    let _0: int // _0 // return
    let _1: int[] // xs // param
    let _2: int // total
    let _3: int // i
    let _4: bool
    let _5: int
    let _6: int
    let _7: int
    let _8: int[]
    let _9: int

    bb0: {
        _2 = const 0_i64;
        _3 = const 0_i64;
        goto -> bb1;
    }

    bb1: {
        _5 = copy _3;
        _6 = len(_1);
        goto -> bb2;
    }

    bb2: {
        _4 = copy _5 < copy _6;
        branch copy _4 -> [bb5, bb3];
    }

    bb3: {
        _0 = copy _2;
        goto -> bb4;
    }

    bb4: {
        return;
    }

    bb5: {
        _8 = copy _1;
        _9 = copy _3;
        _7 = copy _8[_9];
        _2 = copy _2 + copy _7;
        _3 = copy _3 + const 1_i64;
        goto -> bb1;
    }
}
```

![The control-flow graph of sum: bb0 to bb1 to bb2, which branches to bb5 or bb3; bb5 jumps back to bb1; bb3 goes to bb4 and returns.](/diagrams/baml-rust/sum-cfg.svg "The MIR of <code>sum</code> as a graph. The one backward jump, bb5 to bb1, is the loop.")

The naive approach to get around this is a loop around a match block. This is not wrong and passes all test cases but LLVM doesn’t see the loop you wrote, it only sees a single loop with a switch so i never lands in a register and its unable to optimize through it (vectorization/hoisting). 

<!-- VISUAL: `sum` as generated loop/match Rust, next to `sum` as structured Rust. Pull both from the emitter. -->

We must emit the control flow that LLVM wants. Every back edge turns into a loop and a forward jump becomes a break ‘label. This only works if every loop has exactly a single entry-point. After a sweep of 15,012 BAML functions, we found no exceptions to this. This doesn’t mean much as its not something we formally verified. To get around this we created two rules:

- the only jump allowed to go backwards is a loop jumping to its own header
- the only way into a loop is through that same header

The MIR builder checks both rules against every function at compile time which solves this problem without causing runtime issues

<!-- TODO handoff: `sum` is fast now. Put an await inside it and it can't be compiled this way. -->

## Pausing

<!-- TODO rewrite this section. Stakes first: BAML has no async keyword, so any function can pause: an await, a sys op, or a call into anything that can pause. LLM calls are the common case, not the only one. Use a real function that awaits instead of A and B.
Beats: the interpreter keeps frames in a Vec, so it can stop anywhere -> a compiled call is a CPU call, and the only way to hand the thread back is to return -> naive approach: state machines -> the problem: pausing spreads up the call graph, 69% of functions at 1.3-1.8x bytecode against 12-20x for the rest -> fibers: a second stack per VM, suspend and resume as a stack-pointer swap -> cost: 3.7 KB per paused task. -->

![Three panels: sum runs on the fiber; suspend swaps the stack pointer back to the VM with Await(fut); resume swaps it back into suspend.](/diagrams/baml-rust/fiber-switch.svg "A pause is a stack-pointer swap.")

<!-- RAW MATERIAL (flagged as AI-sounding, rewrite from scratch, keep the facts):
In the BAML interpreter, a function call ≠ a CPU call. The VM pushes a Frame onto a Vec and the CPU stays in the VM exec loop. Bytecode functions can pause anywhere since the Vec retains all the information they need to resume (stack pointers, locals)

Compiled function A calling compiled function B is a real CPU call. The CPU is inside A and the only way to give the thread to B is to return which destroys A. The first approach was to compile any function that might pause as a simple state machine. Putting locals into frame slots and saving a block number to resume from. This worked fine but since ANY BAML function can pause, after profiling, this proved to be be 1.3-1.8x slower than Bytecode for 69% of functions, against a 12-20x speedup on functions that didn’t pause. This was quite unacceptable. 

What if we just give each VM its own stack to store this pause data? Giving it a second stack called a ‘fiber’ lets us get around this issue pretty easily. 

Since the CPU's stack pointer is a register and nothing says it has to point at the thread's stack,  each VM can maintain its own its own fiber. When function B needs to await, it simply calls vm.suspend(Await(fut)) which pushes the live registers onto the fiber stack, saves the fiber's stack pointer, and loads the thread's stack pointer back. Execution lands in the VM, which now holds a message saying "B is waiting on this future" and can go run other tasks. 

Resume is the same thing backwards, you simply save the thread's pointer, load the fibers, pop the registers, and execution returns into the middle of suspend, which hands B back its result. From B's point of view, it called a function that took a while.

This costs almost nothing for functions that dont pause and a mere 3.7KB of parked memory per task that does !
-->

## Garbage collection

<!-- TODO crux: `sum` holds `xs` across the await, and the GC moves objects. The obvious answer is stack maps, and Rust has none. The GC only runs when every VM is paused at a safe point. Before every pause, live heap values are written to the VM's frame slots and reloaded after. The collector never scans a fiber stack, so a VM paused in compiled code looks exactly like one paused in bytecode. -->

![A paused VM: the fiber stack holds saved registers and scalars, the frame slot holds xs, and the GC reads only frame slots.](/diagrams/baml-rust/paused-vm.svg "Before a pause, heap values move to frame slots. The GC never scans the fiber.")

## Building it with agents

I am no expert in building compilers. This project was actually my first introduction to the inner workings of a programming language.

Using a verification first approach, i was able to push our a simple working version of this project in < 2 weeks. 

<!-- TODO crux: bytecode is the oracle. 9,711 of 9,711 corpus programs byte-identical as bytecode and compiled, again under GC_STRESS=1.
- the agent got the project, made the decisions, and produced a first draft that passed every test before I read any code
- slimming passes: removing code until only what the tests need is left (numbers from #5312, #5318, #5348-5350)
- what agents were good at: anything with a pass/fail check
- what they were bad at: things without an oracle (drifting from the plan, misattributing perf, big calls on one report, checking their own work)
-->

## Performance

<!-- TODO crux: every compiled call still pushes the VM's frame, so fib(32) runs at only 1.36x bytecode. Why the frame exists: recursion limit, stack traces, telemetry, GC, resume, cancel. The fix: frameless calls for callees that can't pause, plus a direct_depth counter so stack overflow fires at the same depth. -->

<!-- TODO: honest numbers against the interpreter and against Node. Wins on loops and sorts; behind on calls and object-heavy programs; why: the per-call frame and the VM's object model. -->

<!-- VISUAL: one bar chart, interpreter vs compiled vs Node, per workload. -->

## Runtime v2

<!-- TODO: runtime v2. One heap per event loop, typed object layouts, our own copying collector, closed-world dispatch. The spike beats Node on 7 of 12 workloads. -->
