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

<!-- NUMBERS: kpis-native-v0-frame-records (2026-10-22, bench/frame-records f90ef6b, the merged compiled-call design; 8-core x86 VM, telemetry off, 5 trials). 29 workloads vs the interpreter: geomean 3.45x, median 2.77x, compute 5.4x, max 33.6x (nested loops 500x500), startup 0.95x. Earlier runs: fibers 2.77x, native-v0 3.15x. The 34x "geomean" in older notes is the abandoned Rc backend, not this one. -->

We wrote a new backend for the BAML compiler that lets us compile all BAML code into Rust. On average the compiled code runs ==3.5x== faster than our interpreter, and up to ==34x== faster on tight loops.

<!-- TABLE: same run as the intro numbers (kpis-native-v0-frame-records, 2026-10-22, 8-core x86 VM, telemetry off, median of 5 trials). Node on the same run: nested loops 0.466 ms, generate+sort 5.27 ms (both slower than compiled). -->

| Workload | Interpreter | Compiled | Speedup |
|:---|---:|---:|---:|
| nested loops 500×500 | 12.61 ms | 0.38 ms | ==33.6×== |
| tree walk, 262k nodes | 892 ms | 35.8 ms | ==24.9×== |
| array traversal 8k | 10.33 ms | 0.86 ms | ==12.0×== |
| 1M function calls | 80.5 ms | 8.1 ms | ==9.9×== |
| Richards scheduler | 578 ms | 114 ms | ==5.1×== |
| agent loop, 300 conversations | 129 ms | 87 ms | ==1.5×== |

BAML may look like a small language from the outside, but it is extremely feature heavy and provides a lot of runtime guarantees. It reads like TypeScript and is concurrent like Go. Any function can await/pause and there's no `async` keyword. It also profiles every function call it makes down to the nanosecond and automatically tracks where each error started and how it moved up the stack.

All this to say that this project was much harder than initially anticipated.

![The BAML compiler: source, tokens, CST, AST, HIR, TIR and MIR are shared. From MIR one path emits bytecode for the VM exec loop; the new path emits Rust, built by rustc with fat LTO into compiled functions. Both live in one executable with the heap, GC and BTEL, and call each other.](/diagrams/baml-rust/pipeline.svg)

This diagram shows the inner workings of the BAML compiler and all of its intermediate representations. We chose to compile from MIR, one level above bytecode. Any higher and we would have to redo all of BAML's lowering ourselves and hope we made the same choices as the bytecode compiler.

## Why Rust

<!-- TODO honesty: we ruled LLVM IR, C and Cranelift out by argument; we didn't benchmark them. Say so. -->

Most of the options we looked at end up at LLVM or something like it. The question that mattered to us was : "what sits between our MIR (mid-level intermediate representation) and the runtime? and how little of the runtime can we rebuild to get the maximum amount of optimization?". 

LLVM IR is a decent pick. It has a simliar system to GOTO which can be used to jump around blocks which means we dont need to rebuild structured loops from our MIR. Since our VM is written in Rust, the IR can only call it through the C ABI. This means all VM calls become a black box that the inliner cannot optimize through unless they are rewritten as IR operations. This is too much work.

C also has GOTO ootb so MIR can compile to it 1:1. The ABI wall is hit with this as well since even + in BAML is a 63 bit checked add that lives in a VM helper which C cannot see nor optimize.
Cranelift can only inline its own IR meaning our Rust runtime is again a black box.

Since our VM runtime is written in rust, most of these problems disappear with this choice. Generated code calls Vm functions that already exist and can reuse the same types. WIth fat LTO, LLVM optimizes the gneerated code and the runtime as a single unit which means shared helpers also get inlined. This is great. WIth rustC tpechecking the output too, we find most field index errors at compile time.

<!-- TODO handoff: the three things Rust doesn't give us: goto, a way to pause mid-stack, stack maps. Each is a section below. -->

## Control flow

<!-- TODO what `sum` costs in the interpreter: each bytecode op pays decode, tag check and stack traffic; the compiled loop keeps `i` and `total` in registers. Thesis sentence goes here. -->

<!-- @claude Hari: is it HIR, TIR, what comes before/after? bytecode after?
Answer: source -> AST -> HIR -> TIR (typed HIR) -> MIR, and MIR then becomes either bytecode or Rust. So x = TIR (after type checking), y = bytecode/Rust.
"Level 3" is off (AST, HIR, TIR come first); drop the number and say "after type checking".
MIR = mid-level intermediate representation (not "misl intermediary"). -->

<!-- @claude Hari: bracket the full form of terms like MIR or IR.
Answer, first use only: IR (intermediate representation), AST, HIR (high-level IR), TIR (typed IR), MIR (mid-level IR), CFG (control-flow graph), FFI (foreign function interface), ABI (application binary interface), LTO (link-time optimization), SIMD (single instruction, multiple data). -->

<!-- TODO why MIR and not typed BAML (TIR). The reasons from the Oct 1 decision:
- GC rooting and evaluation order are MIR facts; TIR has no temporaries or program points
- the structurer needs a control-flow graph
- irreducible control flow only exists after lowering, so MIR is where the "Rust has no goto" objection can be answered at all
-->

The main problem with GOTO is irreducible control flow: jumps that can't be rewritten as a Rust `loop` and `match`.

The naive approach to get around this is a loop around a match block in Rust. This technically works, but LLVM can't reliably find and optimize the loops inside the match statement. It can't [vectorize]{Run several iterations of a loop at once with SIMD instructions, e.g. four adds in one instruction.} the loop or [hoist]{Move work that gives the same answer every iteration out of the loop, so it runs once.} work out of it, so it's pretty slow at runtime.

```rust naive.rs
let mut block = 0;
loop {
    match block {
        0 => { total = 0; i = 0; block = 1; }
        1 => { n = len(xs); block = 2; }
        2 => { block = if i < n { 5 } else { 3 }; }
        3 => { result = total; block = 4; }
        4 => return result,
        5 => { total += xs[i]; i += 1; block = 1; }
        _ => unreachable!(),
    }
}
```

For reference, here is a `while` loop in BAML and its MIR:

```baml sum.baml tab

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

```mir sum.mir open tab selected
fn user.sum(xs: int[]) -> int {
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

![The control-flow graph of sum: bb0 to bb1 to bb2, which branches to bb5 or bb3; bb5 jumps back to bb1; bb3 goes to bb4 and returns.](/diagrams/baml-rust/sum-cfg.svg)

<!-- @claude Hari: drop the diagram explanation. Done: the caption is gone; it's explained in the two sentences below. -->

Note that the arrow from `bb5` back to `bb1` is the only jump that goes backwards.

<!-- @claude Hari: what does LLVM need to optimize?
Answer: a natural loop. One header block that every iteration passes through, plus a jump back to it. Rust's `loop` gives exactly that. Loop + match hides it: the only loop LLVM sees is the dispatcher, so it can't reliably find the real one (it sometimes untangles tiny cases, so say "can't reliably", not "never").
Vectorization: running several iterations at once with SIMD instructions, e.g. four adds in one instruction.
Hoisting: moving work that gives the same answer every iteration out of the loop so it runs once. -->

<!-- @claude Hari: highlight code bits like notion. Done: anything in backticks renders as a tinted pill. -->

We can turn every back edge into a loop and every forward jump into a `break 'label`. 
This only works if every loop has exactly one entry point. After a sweep of ~15k BAML functions, we found no exceptions to this. We did not formally verify this finding, so instead we get around it with two rules:

1. the only jump allowed to go backwards is a loop jumping to its own header
2. the only way into a loop is through that same header

The MIR builder checks both rules at compile time. The Rust we emit for `sum` looks like this:

<!-- @claude Hari: "how? what problem is solved? see tags above, we need to mention the problem here"
Answer: Rust can only express loops with one way in. If MIR ever produced a loop you could enter from two places, the emitter couldn't write it as Rust. The sweep only says "none so far"; the two rules make it impossible.
Fact check: PR #5222 (the rules in the MIR builder) is still open, not merged. On canary today the Rust backend checks each function and rejects any irreducible one, which then stays bytecode. Either merge #5222 before publishing or describe that fallback. -->

```rust user_sum.rs
'l1: loop {
    l5 = l3;
    l6 = expect_int(vm.container_len(l1)?)?;
    l4 = l5 < l6;
    if l4 {
        l9 = l3;
        l7 = expect_int(vm.load_array_element(l1, Value::int(l9))?)?;
        l2 = vm.add_i64(l2, l7)?;
        l3 = vm.add_i64(l3, 1)?;
        continue 'l1;
    } else {
        return Ok(l2);
    }
}
```

LLVM can see this loop and optimize it, which makes larger `while` loops 2-5x faster at runtime.

sum is fast now, the remaining issue is `await`

<!-- TODO handoff: `sum` is fast now. Put an await inside it and it can't be compiled this way. -->

## Pausing

The other big problem is task suspension. A compiled BAML function is simply native Rust function with locals in task's own stack frame which is popped on function return.
This makes it impossible to hand control and data back to the VM at resume time for our native runtime without creating a new state machine.

We solve this with stackful coroutines(@claude hyperlink this to corosensei..). Each VM owns a separate stack (a `fiber`), and compiled code runs on the fiber instead of the thread's local stack. Suspending a function is then simply a context switch between threads.

A function can call `vm.suspend` with something like `Await(future)`. `suspend` pushes the callee-saved registers onto the fiber and switches the stack pointer back to the thread's stack, returning control to the VM. 
The VM handles the request same as it would for bytecode and schedules other tasks in the meantime.

To resume, the VM switches the stack pointer back to the fiber and restores the registers. `suspend` then returns the request's result like an ordinary function call in the compiled RUST.

![Three panels: sum runs on the fiber; suspend swaps the stack pointer back to the VM with Await(fut); resume swaps it back into suspend.](/diagrams/baml-rust/fiber-switch.svg "A pause is a stack-pointer swap.")

<!-- SOURCES: corosensei (stackful coroutines), vm.suspend(Step) and Step::Await in bex_vm compiled_rt; 4 MiB lazy fiber stack (fiber.rs STACK_SIZE); 3.7 KB per parked task = 10k sleeping tasks 384 MB compiled vs 347 MB bytecode (PR #5318); state machines: 69% of functions at 1.3-1.8x slower than bytecode (pr5264-decisions). -->

Functions that never suspend pay almost nothing in this approach. A suspended task occupies only ~3.7 KB in memory.

The alternative was stackless coroutines + compiling every function that may suspend into a state machine (simliar to Rust's `async`). 
Since suspension is transitive, this design spread to ~69% of compiled functions, making them ~1.3–1.8x slower than bytecode.

## Garbage collection

<!-- TODO crux: `sum` holds `xs` across the await, and the GC moves objects. The obvious answer is stack maps, and Rust has none. The GC only runs when every VM is paused at a safe point. Before every pause, live heap values are written to the VM's frame slots and reloaded after. The collector never scans a fiber stack, so a VM paused in compiled code looks exactly like one paused in bytecode. -->

<!-- NOTE: real output, the top of the same 'l1 loop in user_sum, trimmed the same way. Every 16 iterations it may yield; xs (l1) goes into frame slot 0 before the suspend and comes back after. -->

```rust user_sum.rs
if iterations % 16 == 0 && vm.should_yield() {
    vm.set_slot(fr, 0, l1);
    vm.suspend(Step::Yield)?;
    l1 = vm.slot(fr, 0);
}
```

![A paused VM: the fiber stack holds saved registers and scalars, the frame slot holds xs, and the GC reads only frame slots.](/diagrams/baml-rust/paused-vm.svg "Before a pause, heap values move to frame slots. The GC never scans the fiber.")

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
