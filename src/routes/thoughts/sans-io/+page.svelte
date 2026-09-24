<script>
  import Seo from "$lib/Seo.svelte";
  import NetworkTiming from "$lib/NetworkTiming.svelte";

  let { data } = $props();
  const title = "no more async";
</script>

<Seo
  {title}
  description="Moving async out of stateful protocol code, so each call finishes a step and returns the work to do next."
/>

<main class="thought sans-io">
  <nav><a href="/thoughts/" class="back-link" aria-label="Back to thoughts">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">September 2026</p>
    </header>

    <p>
      I’ve been moving async out of the parts of my code that own state. I want to feed
      that code a message and let it finish a step without waiting on anything else.
      A network request can just be something that step produces.
    </p>

    <NetworkTiming />

    <p>
      An async function still reads from top to bottom. When it yields, other tasks can
      run before it resumes. If they share mutable state, understanding the next line
      can mean reconstructing what happened elsewhere while the function was waiting.
    </p>

    <p>
      A producer/consumer boundary gives me a different way to organize this. I/O
      completions arrive as messages in an inbox. One consumer owns the state and leaves
      outgoing work in an outbox. The network worker can still use async; it never
      changes the consumer’s state directly.
    </p>

    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this figure horizontally.) -->
      <div class="diagram-scroll" tabindex="0" role="region" aria-label="Program logic sends requests through a queue to an I/O worker; replies and errors return through another queue.">
        <img src="/diagrams/message-boundary.svg?rev=7263de0fe373" width="640" height="300" alt="Program logic sends requests through a queue to an I/O worker; replies and errors return through another queue." />
      </div>
    </figure>

    <p>
      <a href="https://sans-io.readthedocs.io/how-to-sans-io.html">Sans I/O</a> applies
      this separation to protocol code. The state stays in an ordinary Rust struct,
      whose methods run to completion before the caller delivers the next input.
      For example, the retry step for one pending request might look like this:
    </p>

    <div class="code-example">
      {@html data.retryHtml}
    </div>

    <p>
      <code>tick</code> updates the deadline and returns a send request for the caller
      to execute. The caller can resolve the request ID to bytes in a buffer pool and
      pass them to the I/O worker. To test the retry path, I can supply the deadline as
      <code>now</code> and inspect the returned action without opening a socket or
      starting a runtime.
    </p>

    <p>
      The queues don’t make the whole system deterministic. Workers can still race to
      enqueue messages. Replaying the core requires their contents and delivery order,
      its initial state, the time supplied at each step, and any random choices.
    </p>

    <p>The same protocol can now run against a simulator.</p>

    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this figure horizontally.) -->
      <div class="diagram-scroll" tabindex="0" role="region" aria-label="A real I/O worker or a simulator feeds the same inbox and the same program logic.">
        <img src="/diagrams/controlled-inputs.svg?rev=4a4cf3ab762c" width="640" height="320" alt="A real I/O worker or a simulator feeds the same inbox and the same program logic." />
      </div>
    </figure>

    <p>
      The simulator can leave this request unanswered, advance to <code>retry_at</code>,
      and call <code>tick</code>. It can also deliver a reply just before the deadline
      to test whether that prevents a retry. Neither case has to wait out the timeout.
      A fuzzer can vary these event histories and save one that breaks an invariant.
    </p>

    <p>
      Writing more code with agents has made this more useful to me. I can give an agent
      the initial state and the history that failed, then let it work against that case.
      I can also change an event or its timing to check the explanation it gives me.
    </p>
  </article>
</main>

<style>
  h1 { text-wrap: balance; }
  .code-example { font-size: 0.8em; }
  .code-example :global(pre) { width: 100%; }
</style>
