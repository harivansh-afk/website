<script>
  import Seo from "#lib/Seo.svelte";
  import Views from "#lib/Views.svelte";

  let { data } = $props();

  const title = "deterministic state machines";
</script>

<Seo
  {title}
  description="Moving I/O out of state machines, with a Rust retry example, controlled event orderings, and reproducible failures."
/>

<main class="thought sans-io">
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta"><span>September 2026</span><span>~6 min read</span><Views /></p>
    </header>
    <p>I’ve been moving more of my code into deterministic state machines. I want to reproduce a component’s state changes from its initial state and the inputs it received. The difficulty is that <mark>a function’s arguments often aren’t all of its inputs.</mark> It might also read the clock, receive data from a socket, or fetch some state through an RPC.</p>
    <p>Consider a request we want to retry after ten seconds if we’re still waiting for a reply. Whether it needs another attempt depends on the current time and whether a reply has already been processed. If the request code manages the socket and timer itself, reproducing that decision means controlling both operations. A reply that arrived after the timeout on one run might arrive before it on the next.</p>
    <p>I separate the retry logic from those operations by having the caller supply the time and any replies. The request keeps its deadline and completion flag, so it can decide whether another attempt is due. <mark>If it needs to retry, it returns a <code>Send</code> action and the caller sends the request.</mark> The caller can use async to wait for the socket, while the request’s methods finish updating its fields before the next input is handled. This is the <a href="https://sans-io.readthedocs.io/how-to-sans-io.html">Sans I/O</a> pattern used in protocol libraries.</p>
    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="diagram-scroll" tabindex="0" role="region" aria-label="I/O and request state">
        <picture>
          <source media="(max-width: 640px)" srcset="/diagrams/request-boundary-mobile.svg" width="360" height="480" />
          <img src="/diagrams/request-boundary.svg" width="760" height="330" alt="The caller reads the clock and socket, then calls tick(now) or on_reply(). Request owns its state and returns Send or Complete actions for the caller to perform." />
        </picture>
      </div>
      <figcaption>If <code>tick(now)</code> returns <code>Send</code>, the caller sends the request. When a reply arrives, it calls <code>on_reply()</code>.</figcaption>
    </figure><h2 id="state-transitions"><a class="bare" href="#state-transitions">State transitions</a></h2>
    <p>Assume request 7 was sent at time zero, with its first retry due at ten seconds. Its <code>Request</code> struct holds the ID, a <code>done</code> flag, a <code>retry_at</code> deadline, and a ten-second <code>retry_interval</code>. Time is a <code>Duration</code> measured from that origin.</p>
    {@html data.handlers}
    <p>For a pending request, a call to <code>tick</code> at or after the deadline advances the deadline and returns <code>Send</code>. The caller sends the request and routes replies to <code>on_reply</code>, which returns <code>Complete</code> for the first reply and no action for later ones. The <code>done</code> flag stops this client from reporting completion twice. The server could still execute both attempts, so it needs to recognize a request ID it has already handled or use an operation whose effect is the same when repeated.</p>
    <p>If a failed socket write should change the retry deadline, the caller would pass that error back through another method. The request could then update its deadline without making the write itself.</p>
    <h2 id="event-ordering"><a class="bare" href="#event-ordering">Event ordering</a></h2>
    <p>A test can deliver the reply before checking the deadline, or call <code>tick</code> at the deadline before delivering the reply. Both cases exercise the same implementation without opening a socket or waiting for a timeout.</p>
    <figure>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="diagram-scroll" tabindex="0" role="region" aria-label="Reply and timeout delivery orders">
        <picture>
          <source media="(max-width: 640px)" srcset="/diagrams/retry-order-mobile.svg" width="360" height="648" />
          <img src="/diagrams/retry-order.svg" width="760" height="380" alt="Both histories start with request 7 pending. Reply then tick at ten seconds returns Complete then no action. Tick at ten seconds then reply returns Send then Complete. Both complete once, but only the second ordering requests a retry." />
        </picture>
      </div>
      <figcaption>Processing the reply before <code>tick(10s)</code> prevents a <code>Send</code> action.</figcaption>
    </figure><p>Here, <code>pending_request()</code> constructs that initial state, with the first retry due at ten seconds.</p>
    {@html data.orderings}
    <p>If the reply is sitting unread in the socket buffer, <code>tick</code> can still trigger a retry at the deadline.</p>
    <h2 id="replay"><a class="bare" href="#replay">Replay</a></h2>
    <p>The tests above each deliver one reply. If we forgot the <code>done</code> check in <code>on_reply</code>, both would still pass. A timeout followed by two replies exposes the mistake: the request returns <code>Complete</code> twice.</p>
    {@html data.duplicate}
    <p>For this failure, the history is <code>Tick(10s), Reply, Reply</code>. Replaying it requires the <mark>initial state, input values, delivery order, and code version.</mark> For randomized retries, we can record the chosen delay so a replay doesn’t choose a different deadline. For an RPC, we need the result the component received, not just a record that the call happened.</p>
    <p>Stepping through that history shows <code>done</code> becoming true on the first reply. A second <code>Complete</code> action would expose the bug even though <code>done</code> stays true. After changing the code, we can rerun the same calls and inspect their results without sending requests to the server.</p>
    <h2 id="simulation-testing"><a class="bare" href="#simulation-testing">Simulation testing</a></h2>
    <p>A simulation can try a reply after several retries, two replies in a row, or a run with no reply at all. After each input it checks whether the request has completed more than once and saves the sequence if it has. A ten-second timeout can be tested by <mark>passing that time to <code>tick</code></mark>, without sleeping.</p>
    <p>The <a href={data.playground}>complete example</a> starts with a pending request and tries sequences of replies and time updates, up to six inputs, without moving the clock backwards. A request that never completes would pass the duplicate-completion check, so the ordering tests also require the first reply to return <code>Complete</code>.</p>
    <p>These tests would still pass if the socket-reading code dropped every reply: they call <code>on_reply</code> directly. To test that path, we need to send a request through the socket and check that its reply reaches the state machine.</p>
    <p><a href="https://apple.github.io/foundationdb/testing.html">FoundationDB</a> and <a href="https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md">TigerBeetle</a> test database clusters with simulators that can delay messages, fail storage operations, and repeat the same sequence of faults.</p>
    <p>If I ask an agent to fix the duplicate-reply bug, I can give it the three calls above and the failing assertion. It can change <code>on_reply</code>, rerun the sequence, and check whether the second reply still completes the request.</p>
  </article>
</main>

<style>
  h1 { text-wrap: balance; }
  article :global(h2) { margin-top: 2.5em; }
  article :global(pre) { width: 100%; font-size: 0.78em; }
  article :global(figure picture) { display: block; }
  article :global(figure img) { min-width: 0; }
  article :global(figcaption) { max-width: 65ch; }
  article :global(a code) { color: inherit; }

  @media (prefers-color-scheme: light) {
    article :global(.code) { background: #fff; }
  }

  @media (max-width: 640px) {
    main.sans-io { font-size: 1rem; padding-inline: 1rem; }
    article :global(pre) { font-size: 0.82em; padding: 0.75rem; }
  }
</style>
