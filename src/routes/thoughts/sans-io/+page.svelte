<script>
  import Seo from "$lib/Seo.svelte";

  let { data } = $props();
  const title = "no more async";
</script>

<Seo
  {title}
  description="Keeping async out of the code that makes decisions, so a failure that depends on timing can be replayed by me or by an agent."
/>

<main class="thought sans-io">
  <nav><a href="/thoughts/" class="back-link" aria-label="Back to thoughts">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">September 2026</p>
    </header>

    <p>
      I’ve been taking async out of the code that makes decisions. For a network
      request, that’s the code tracking what was sent, whether a reply came back, and
      when to retry. The sending and receiving can stay async.
    </p>

    <p>
      When that logic awaits the network and a timer itself, the order they finish in
      can change what it does, and I can’t choose that order when I want to reproduce
      a failure.
    </p>

    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this figure horizontally.) -->
      <div class="diagram-scroll" tabindex="0" role="region" aria-label="The same request run twice. In run 1 the reply beats the retry deadline; in run 2 the request is sent again and two replies come back.">
        <img src="/diagrams/reply-timing.svg?rev=c6e687b93d94" width="640" height="250" alt="The same request run twice. In run 1 the reply beats the retry deadline; in run 2 the request is sent again and two replies come back." />
      </div>
      <figcaption>In run 2 the reply is late, so the request goes out again and two replies come back.</figcaption>
    </figure>

    <p>
      So the logic only talks to the network through two queues in memory. It puts
      <code>send 7</code> on the outgoing queue. A network worker sends it and puts
      <code>reply 7</code> on the incoming queue.
    </p>

    <p>
      The logic handles one message completely before it reads the next, and the
      worker never touches its state.
    </p>

    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this figure horizontally.) -->
      <div class="diagram-scroll" tabindex="0" role="region" aria-label="The request logic puts messages on an outgoing queue for the network worker; the worker puts replies on an incoming queue for the logic.">
        <img src="/diagrams/message-boundary.svg?rev=401c9f05472a" width="640" height="300" alt="The request logic puts messages on an outgoing queue for the network worker; the worker puts replies on an incoming queue for the logic." />
      </div>
    </figure>

    <p>
      This is the <a href="https://sans-io.readthedocs.io/">sans I/O</a> pattern. In
      Rust, the retry check takes the current time as an argument instead of reading
      a clock:
    </p>

    <div class="code-example">
      {@html data.tickHtml}
    </div>

    <p>
      <code>tick</code> returns an <code>Action</code> rather than sending anything, and
      the caller puts it on the outgoing queue.
    </p>

    <p>
      Since <code>now</code> is just a
      <code>Duration</code>, a test can pass ten seconds and check for a
      <code>Send</code> without a network or a ten-second wait.
    </p>

    <p>
      In tests I swap the network worker for a simulator. It picks which messages show
      up and when, and skips its clock ahead to the next event instead of actually
      waiting.
    </p>

    <p>
      Since the logic reads one message at a time, feeding it the same messages in the
      same order with the same times gets the same result every time.
    </p>

    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this figure horizontally.) -->
      <div class="diagram-scroll" tabindex="0" role="region" aria-label="Either the network worker or a simulator feeds the same incoming queue and the same request logic.">
        <img src="/diagrams/controlled-inputs.svg?rev=7078c12e2773" width="640" height="320" alt="Either the network worker or a simulator feeds the same incoming queue and the same request logic." />
      </div>
    </figure>

    <p>
      So I can force run 2: the simulator just holds the reply to request 7 until after
      the retry deadline.
    </p>

    <p>
      A fuzzer can then throw lots of different orderings at it and check something
      like “a request never completes twice.” When one breaks that, I save it as a test.
    </p>

    <p>
      That test is what I hand to an agent. It can rerun the exact failure after every
      change, and I can move one event around to see if its explanation of the bug
      still holds up.
    </p>

    </article>
</main>

<style>
  h1 { text-wrap: balance; }
  .code-example { font-size: 0.8em; }
  .code-example :global(pre) { width: 100%; }
</style>
