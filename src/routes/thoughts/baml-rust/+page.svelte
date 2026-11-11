<script>
  import Seo from "#lib/Seo.svelte";
  import Views from "#lib/Views.svelte";

  let { data } = $props();

  const title = "Compiling BAML to Rust";
</script>

<Seo
  {title}
  type="article"
  description="We wrote a new backend for the BAML compiler that lets us compile all BAML code into Rust."
/>

<main class="thought baml-rust">
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta"><span>November 2026</span><span>~7 min read</span><Views /></p>
    </header>
    <p>We wrote a new backend for the BAML compiler that lets us compile all BAML code into Rust. 
    On average the compiled code runs <mark>~3.5x</mark> faster than our interpreter, and up to <mark>34x</mark> faster on tight loops.</p>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="table-scroll" tabindex="0" role="region" aria-label="table"><table>
    <thead>
    <tr>
    <th align="left">Workload</th>
    <th align="right">Interpreter</th>
    <th align="right">Compiled</th>
    <th align="right">Speedup</th>
    </tr>
    </thead>
    <tbody><tr>
    <td align="left"><!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:0" tabindex="0">nested loops 500×500</span></td>
    <td align="right">12.61 ms</td>
    <td align="right">0.38 ms</td>
    <td align="right"><mark>33.6×</mark></td>
    </tr>
    <tr>
    <td align="left"><!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:1" tabindex="0">tree walk, 262k nodes</span></td>
    <td align="right">892 ms</td>
    <td align="right">35.8 ms</td>
    <td align="right"><mark>24.9×</mark></td>
    </tr>
    <tr>
    <td align="left"><!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:2" tabindex="0">array traversal 8k</span></td>
    <td align="right">10.33 ms</td>
    <td align="right">0.86 ms</td>
    <td align="right"><mark>12.0×</mark></td>
    </tr>
    <tr>
    <td align="left"><!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:3" tabindex="0">1M function calls</span></td>
    <td align="right">80.5 ms</td>
    <td align="right">8.1 ms</td>
    <td align="right"><mark>9.9×</mark></td>
    </tr>
    <tr>
    <td align="left"><!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:4" tabindex="0">Richards scheduler</span></td>
    <td align="right">578 ms</td>
    <td align="right">114 ms</td>
    <td align="right"><mark>5.1×</mark></td>
    </tr>
    <tr>
    <td align="left"><!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:5" tabindex="0">agent loop, 300 conversations</span></td>
    <td align="right">129 ms</td>
    <td align="right">87 ms</td>
    <td align="right"><mark>1.5×</mark></td>
    </tr>
    </tbody></table></div>
    <p>BAML may look like a small language from the outside, but it is extremely feature heavy and provides a lot of runtime guarantees. It reads like TypeScript and is concurrent like Go. Any function can await/pause and there's no <code>async</code> keyword. It also profiles every function call it makes down to the nanosecond and automatically tracks where each error started and how it moved up the stack.</p>
    <figure>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="diagram-scroll" tabindex="0" role="region" aria-label="The BAML compiler: source, tokens, CST, AST, HIR, TIR and MIR are shared. From MIR one path emits bytecode for the VM exec loop; the new path emits Rust, built by rustc with fat LTO into compiled functions. Both live in one executable with the heap, GC and BTEL, and call each other."><img src="/diagrams/baml-rust/pipeline.svg?rev=bf9774149224" width="760" height="362" alt="The BAML compiler: source, tokens, CST, AST, HIR, TIR and MIR are shared. From MIR one path emits bytecode for the VM exec loop; the new path emits Rust, built by rustc with fat LTO into compiled functions. Both live in one executable with the heap, GC and BTEL, and call each other." /></div></figure>
    <p>This diagram shows the inner workings of the BAML compiler and all of its intermediate representations. We chose to compile from MIR (mid-level intermediate representation), one level above bytecode. Any higher and we would have to redo all of BAML's lowering ourselves and hope we made the same choices as the bytecode compiler.</p>
    <h2 id="why-rust"><a class="bare" href="#why-rust">Why Rust</a></h2>
    <p>Most of the options we looked at end up at LLVM or something like it. The question that mattered to us was: "What sits between our MIR and the runtime, and how little of the runtime can we rebuild to get the maximum amount of optimization?" </p>
    <p>LLVM IR is a decent pick. It is basic blocks and branches, the same shape as our MIR, so we don't need to rebuild structured loops from our MIR. Since our VM is written in Rust, the IR can only call it through the C ABI. This means all VM calls become a black box that the inliner cannot optimize through unless they are rewritten as IR operations. This is too much work.</p>
    <p>C also has <code>goto</code> ootb, so MIR can compile to it 1:1. The ABI wall is hit with this as well, since even <code>+</code> in BAML is a 63-bit checked add that lives in a VM helper, which C can neither see nor optimize.
    Cranelift can only inline its own IR, meaning our Rust runtime is again a black box.</p>
    <p>Since our VM runtime is written in Rust, most of these problems disappear with this choice. Generated code calls VM functions that already exist and can reuse the same types. With fat LTO, LLVM optimizes the generated code and the runtime as a single unit, which means shared helpers also get inlined. This is great. rustc typechecks the output too, so we find most field index errors at compile time.</p>
    <h2 id="control-flow"><a class="bare" href="#control-flow">Control flow</a></h2>
    <p>MIR is basic blocks connected by gotos, and Rust has no <code>goto</code>.
    We must make do with loops, ifs and breaks.</p>
    <p>For reference, here is a <code>while</code> loop in BAML and its MIR:</p>
    <div class="code-tabs"><input type="radio" class="tab-input" name="tabs-0" id="tabs-0-0" /><input type="radio" class="tab-input" name="tabs-0" id="tabs-0-1" checked /><nav class="tab-labels"><label for="tabs-0-0">sum.baml</label><label for="tabs-0-1">sum.mir</label></nav><div class="tab-panel">
    {@html data.sumBaml}
    </div><div class="tab-panel">
    {@html data.sumMir}
    </div></div>
    <figure>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="diagram-scroll" tabindex="0" role="region" aria-label="The control-flow graph of sum: bb0 to bb1 to bb2, which branches to bb5 or bb3; bb5 jumps back to bb1; bb3 goes to bb4 and returns."><img src="/diagrams/baml-rust/sum-cfg.svg?rev=f8de6ab9a754" width="760" height="310" alt="The control-flow graph of sum: bb0 to bb1 to bb2, which branches to bb5 or bb3; bb5 jumps back to bb1; bb3 goes to bb4 and returns." /></div></figure>
    <p>Note that the arrow from <code>bb5</code> back to <code>bb1</code> is the only jump that goes backwards.</p>
    <p>The naive approach is a loop around a match, with one arm per basic block. This technically works, but LLVM can't reliably find and optimize the loops inside the match. It can't <!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:6" tabindex="0">vectorize</span> the loop or <!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:7" tabindex="0">hoist</span> work out of it, so it's pretty slow at runtime.</p>
    {@html data.naive}
    <p>We can turn every back edge into a loop and every forward jump into a <code>break 'label</code>. 
    This only works if every loop has exactly one entry point (otherwise it's <!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:8" tabindex="0">irreducible control flow</span>). After a sweep of ~15k BAML functions, we found no exceptions to this. We did not formally verify this finding, so instead we get around it with two rules:</p>
    <ol>
    <li>the only jump allowed to go backwards is a loop jumping to its own header</li>
    <li>the only way into a loop is through that same header</li>
    </ol>
    <p>The MIR builder checks both rules at compile time. The Rust we emit for <code>sum</code> looks like this:</p>
    {@html data.userSum}
    <p>LLVM can see this loop and optimize it, which makes larger <code>while</code> loops 2-5x faster at runtime.</p>
    <h2 id="pausing"><a class="bare" href="#pausing">Pausing</a></h2>
    <p>The second thing Rust doesn't offer by default is pausing a function during execution. A function's locals live in its stack frame, which is popped on return, so compiled code can't hand control back to the VM mid-call and resume later.</p>
    <p>The usual workaround is compiling every function that may suspend into a state machine (Rust's <code>async</code> does this). Since suspension is transitive, this design spreads to ~69% of compiled functions and makes them ~1.3–1.8x slower than the interpreter itself.</p>
    <p>We solve this with <a href="https://github.com/Amanieu/corosensei">stackful coroutines</a>. Each VM owns a separate stack (a <code>fiber</code>) and compiled code runs on it, so suspending is just a context switch between two stacks on the same thread.</p>
    <p>A function pauses by calling <code>vm.suspend</code> with a request such as <code>Await(future)</code>. <code>suspend</code> pushes the callee-saved registers onto the fiber and switches the stack pointer back to the thread's stack, returning control to the VM. 
    The VM handles the request the same way it would for the interpreter and schedules other tasks in the meantime.</p>
    <p>To resume, the VM switches the stack pointer back to the fiber and restores the registers. <code>suspend</code> then returns the request's result like an ordinary function call.</p>
    <figure>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="diagram-scroll" tabindex="0" role="region" aria-label="Three panels: classify runs on the fiber; suspend swaps the stack pointer back to the VM with Await(fut); resume swaps it back into suspend."><img src="/diagrams/baml-rust/fiber-switch.svg?rev=8ca3ae4dee57" width="760" height="330" alt="Three panels: classify runs on the fiber; suspend swaps the stack pointer back to the VM with Await(fut); resume swaps it back into suspend." /></div></figure>
    <p>Functions that never suspend pay almost nothing. A suspended task occupies ~3.7 KB in memory (depending on object being a generic or growing container like array)</p>
    <h2 id="garbage-collection"><a class="bare" href="#garbage-collection">Garbage collection</a></h2>
    <p>BAML's GC is a <!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:9" tabindex="0">generational</span>, <!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:10" tabindex="0">stop-the-world</span> <!-- svelte-ignore a11y_no_noninteractive_tabindex --><span class="term" data-def="term:11" tabindex="0">copying</span> collector. When it runs, every VM is stopped and the live objects (anything still reachable) in the generation being collected are copied into an older one. The source generation is then wiped by the collector.</p>
    <p>Since every live object moves to a new address, every pointer to it has to be updated. The interpreter can do this since all of its pointers live in VM frame slots, but Rust doesn't expose the pointers a compiled function holds in its locals/registers.</p>
    <p>Our MIR types every local and tracks which ones are live at each point. At compile time the backend knows which live locals hold heap values at every point where a collection can happen (a pause, or a VM call that may collect). It emits code to copy them into the VM's frame slots (already scanned by the GC) before that point, and the compiled code reads them back after.</p>
    <p>The GC never scans the fiber. To the collector, a paused compiled function looks exactly like paused bytecode (ie. we didn't need to touch any GC code for the new native backend)</p>
    <h2 id="escape-analysis"><a class="bare" href="#escape-analysis">Escape analysis</a></h2>
    <p>BAML has a <code>spawn</code> keyword (like Go's <code>go</code>), and tasks run on multiple threads over a single shared heap. Since any array or map could be accessed by two threads at once, every array and map access takes a spin lock and every field access is atomic. This also applies to operations that are provably local, causing slowdown where it can be avoided.</p>
    <p>At compile time we follow each object through the program (assignments, function calls and builtins) to see which tasks can reach it.
    If only the task that created it can access it (it's <code>local</code>), then both the compiled code and the interpreter can skip the spin lock.
    This gave us another ~2-3x speedup on array and sort heavy code.</p>
    <h2 id="runtime-v2"><a class="bare" href="#runtime-v2">Runtime v2</a></h2>
    <p>This was a great project and we ended up with a backend that is able to compile 100% of BAML into native Rust code. To keep the scope of this experiment small, we kept the VM's data model as-is.</p>
    <p>Compiled code still goes through the VM for every field read, allocation and container access, so data-heavy programs (like our agent loop) only got ~1.5x faster.</p>
    <p>Our goal is to be as fast as, if not faster than, Node.js and V8. We are working on a v2 runtime with typed object layouts for the heap. Excited to share more soon !</p>
    <!-- hover definitions for the underlined terms (CodeDefs finds them by key) -->
    <template data-def-key="term:0"><div class="def-doc"><p>Two nested loops of 500 iterations each.</p>
    </div></template>
    <template data-def-key="term:1"><div class="def-doc"><p>A read-only recursive walk of a live tree of 262,144 nodes.</p>
    </div></template>
    <template data-def-key="term:2"><div class="def-doc"><p>Iterate, index and rebuild an array of 8,192 integers.</p>
    </div></template>
    <template data-def-key="term:3"><div class="def-doc"><p>1,000,000 calls of a one-line function.</p>
    </div></template>
    <template data-def-key="term:4"><div class="def-doc"><p>The Richards benchmark: an OS task-scheduler simulation, run 50 times.</p>
    </div></template>
    <template data-def-key="term:5"><div class="def-doc"><p>An agent loop over 300 recorded conversations: typed decode into a union, match dispatch and retries.</p>
    </div></template>
    <template data-def-key="term:6"><div class="def-doc"><p>Run several iterations of a loop at once with SIMD instructions, e.g. four adds in one instruction.</p>
    </div></template>
    <template data-def-key="term:7"><div class="def-doc"><p>Move work that gives the same answer every iteration out of the loop, so it runs once.</p>
    </div></template>
    <template data-def-key="term:8"><div class="def-doc"><p>A loop that can be entered at more than one block. No single block is the way in, so it cannot be written as a structured loop (loop, break, continue) without duplicating code.</p>
    </div></template>
    <template data-def-key="term:9"><div class="def-doc"><p>Objects are grouped by age. New objects start in a young generation that's collected often, and the few that survive move to older generations that are collected rarely.</p>
    </div></template>
    <template data-def-key="term:10"><div class="def-doc"><p>Every VM pauses while the collector runs, so no code touches the heap mid-collection.</p>
    </div></template>
    <template data-def-key="term:11"><div class="def-doc"><p>Live objects are copied out to a new region instead of freeing dead ones one by one, so the old region can be reset all at once.</p>
    </div></template>
  </article>
</main>

<style>
  h1 { text-wrap: balance; }
  article :global(pre) { width: 100%; font-size: 0.78em; }
  article :global(figure picture) { display: block; }
  article :global(figcaption) { max-width: 65ch; }
  article :global(a code) { color: inherit; }
  article :global(.draft) { white-space: pre-line; opacity: 0.75; }

  /* benchmark tables: mono figures, hairline rows, labels in the pixel face */
  /* like figures and code, a table keeps its shape and scrolls in its own box on narrow screens */
  article :global(.table-scroll) { margin-block: 1.75rem; overflow-x: auto; }
  article :global(.table-scroll:focus-visible) { outline: 1px solid var(--fg); outline-offset: 0.25rem; }
  article :global(table) { width: 100%; min-width: 30rem; border-collapse: collapse; font-size: 0.9em; }
  article :global(th) {
    padding: 0 0 0.6rem; border-bottom: 1px solid var(--line);
    font-family: var(--pixel); font-size: var(--pixel-size); font-weight: normal;
    text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted);
  }
  article :global(td) { padding: 0.55rem 0; border-bottom: 1px solid var(--line); }
  article :global(:is(th, td) + :is(th, td)) { padding-left: 1rem; }
  article :global(td[align="right"]) { font-family: var(--mono); font-size: 0.875em; font-variant-numeric: tabular-nums; white-space: nowrap; }
  article :global(td mark) { padding: 0.1em 0.35em; }

  /* hover terms in prose: a dotted underline, the code popover on hover */
  article :global(.term) { text-decoration: underline dotted color-mix(in srgb, currentColor 55%, transparent); text-underline-offset: 0.2em; cursor: help; outline: none; }
  article :global(.term:focus-visible) { outline: 1px solid var(--fg); outline-offset: 0.125rem; }

  /* code tabs: neighbouring blocks share a frame; their names are tabs in its bar */
  article :global(.code-tabs) { position: relative; margin-block: 1.5rem; }
  article :global(.code-tabs .tab-input) { position: absolute; opacity: 0; pointer-events: none; }
  article :global(.code-tabs .tab-panel) { display: none; }
  article :global(.code-tabs .tab-panel .code) { margin: 0; }
  article :global(.code-tabs .tab-panel .code-name) { visibility: hidden; }
  article :global(.code-tabs .tab-labels) {
    position: absolute; z-index: 1; top: 1px; left: 1rem;
    display: flex; gap: 1.25rem; padding-block: 0.5rem;
    font-family: var(--pixel); font-size: var(--pixel-size); line-height: 1.4;
  }
  article :global(.code-tabs .tab-labels label) { color: var(--code-muted); cursor: pointer; }
  article :global(.code-tabs .tab-labels label:hover) { color: var(--code-fg); }
  article :global(.code-tabs .tab-input:nth-of-type(1):checked ~ .tab-panel:nth-of-type(1)) { display: block; }
  article :global(.code-tabs .tab-input:nth-of-type(1):checked ~ .tab-labels label:nth-of-type(1)) { color: var(--code-fg); text-decoration: underline; text-underline-offset: 0.35em; }
  article :global(.code-tabs .tab-input:nth-of-type(1):focus-visible ~ .tab-labels label:nth-of-type(1)) { outline: 1px solid var(--code-fg); outline-offset: 0.2rem; }
  article :global(.code-tabs .tab-input:nth-of-type(2):checked ~ .tab-panel:nth-of-type(2)) { display: block; }
  article :global(.code-tabs .tab-input:nth-of-type(2):checked ~ .tab-labels label:nth-of-type(2)) { color: var(--code-fg); text-decoration: underline; text-underline-offset: 0.35em; }
  article :global(.code-tabs .tab-input:nth-of-type(2):focus-visible ~ .tab-labels label:nth-of-type(2)) { outline: 1px solid var(--code-fg); outline-offset: 0.2rem; }
  article :global(.code-tabs .tab-input:nth-of-type(3):checked ~ .tab-panel:nth-of-type(3)) { display: block; }
  article :global(.code-tabs .tab-input:nth-of-type(3):checked ~ .tab-labels label:nth-of-type(3)) { color: var(--code-fg); text-decoration: underline; text-underline-offset: 0.35em; }
  article :global(.code-tabs .tab-input:nth-of-type(3):focus-visible ~ .tab-labels label:nth-of-type(3)) { outline: 1px solid var(--code-fg); outline-offset: 0.2rem; }
  article :global(.code-tabs .tab-input:nth-of-type(4):checked ~ .tab-panel:nth-of-type(4)) { display: block; }
  article :global(.code-tabs .tab-input:nth-of-type(4):checked ~ .tab-labels label:nth-of-type(4)) { color: var(--code-fg); text-decoration: underline; text-underline-offset: 0.35em; }
  article :global(.code-tabs .tab-input:nth-of-type(4):focus-visible ~ .tab-labels label:nth-of-type(4)) { outline: 1px solid var(--code-fg); outline-offset: 0.2rem; }


  @media (max-width: 640px) {
    article :global(pre) { font-size: 0.82em; padding: 0.75rem; }
  }
</style>
