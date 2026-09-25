<script>
  import Seo from "$lib/Seo.svelte";
  import NetworkTiming from "$lib/NetworkTiming.svelte";

  let { data } = $props();
  const title = "no more async";
</script>

<Seo
  {title}
  description="Separating request logic from network work so the same messages and time inputs can reproduce a failure."
/>

<main class="thought sans-io">
  <nav><a href="/thoughts/" class="back-link" aria-label="Back to thoughts">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">September 2026</p>
    </header>

    <p>I’ve been moving async out of the important parts of my code.</p>

    <p>
      For a network request, that means the code tracking what was sent,
      whether a reply arrived, and when to retry.
    </p>

    <p>I want it to handle one message completely before taking the next.</p>

    <NetworkTiming caption="The order of events is part of the input." />

    <p>
      The request logic puts a message like <code>send request 7</code> in an outgoing queue.
    </p>

    <p>
      A network worker picks it up, sends the request, and puts <code>reply for request 7</code>
      in a queue going back.
    </p>

    <p>The request logic reads that message and updates the request’s status.</p>

    <p>That’s a producer/consumer model.</p>

    <p>The queues hold messages in memory.</p>

    <p>
      The network worker can still use async, but it never changes the request
      logic’s state directly.
    </p>

    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this figure horizontally.) -->
      <div class="diagram-scroll" tabindex="0" role="region" aria-label="Request logic sends requests through an outgoing queue to a network worker; replies return through an incoming queue.">
        <img src="/diagrams/message-boundary.svg?rev=7263de0fe373" width="640" height="300" alt="Request logic sends requests through an outgoing queue to a network worker; replies return through an incoming queue." />
      </div>
    </figure>

    <p>
      <a href="https://sans-io.readthedocs.io/how-to-sans-io.html">Sans I/O</a> applies
      this separation to protocol code. The state stays in a Rust struct.
    </p>

    <p>Its methods finish processing one input before the caller gives it another.</p>

    <p>
      For example, this is the retry check for a pending request.
      <code>now</code> is supplied by the caller:
    </p>

    <div class="code-example">
      {@html data.retryHtml}
    </div>

    <p><code>tick</code> returns an instruction to send.</p>

    <p>The code that calls it puts that instruction in the outgoing queue.</p>

    <p>
      The network worker picks it up, finds the request’s bytes in a buffer pool,
      and sends them.
    </p>

    <p>
      If <code>retry_at</code> is ten seconds, a test can pass ten seconds as
      <code>now</code> and check for a <code>Send</code> action.
    </p>

    <p>It needs neither a live network nor a real ten-second wait.</p>

    <p>
      We control the time value the logic reads; the CPU still executes the code normally.
    </p>

    <p>Workers can still race to enqueue messages.</p>

    <p>
      To replay a failure, I need the same starting state, message contents and order,
      time inputs, and random choices.
    </p>

    <p>
      For testing, I can replace the network worker with a simulator that supplies
      messages and time.
    </p>

    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this figure horizontally.) -->
      <div class="diagram-scroll" tabindex="0" role="region" aria-label="A network worker or a simulator supplies messages to the same incoming queue and request logic.">
        <img src="/diagrams/controlled-inputs.svg?rev=4a4cf3ab762c" width="640" height="320" alt="A network worker or a simulator supplies messages to the same incoming queue and request logic." />
      </div>
    </figure>

    <p>
      The simulator can leave request 7 unanswered until the retry deadline, or deliver
      a reply just before it. Both runs use the real request logic. The simulator
      advances its clock to the next scheduled event and supplies that event and time
      to the request logic, without waiting for real time to pass.
    </p>

    <p>
      A fuzzer can generate different event sequences and check a rule like “never
      retry a completed request.” Any sequence that breaks the rule becomes a saved
      test case.
    </p>

    <p>
      Writing more code with agents has made this useful to me. I can give an agent
      that test case and let it rerun the same failure after a change. I can also
      change an event or its timing to check the explanation it gives me.
    </p>
  </article>
</main>

<style>
  h1 { text-wrap: balance; }
  .code-example { font-size: 0.8em; }
  .code-example :global(pre) { width: 100%; }
</style>
