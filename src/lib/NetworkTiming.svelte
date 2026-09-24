<script>
  import { onMount } from "svelte";

  let frame;
  let started = $state(false);
  let visible = $state(false);
  let hidden = $state(false);
  let reducedMotion = $state(true);

  onMount(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotion = preference.matches;
      if (visible && !reducedMotion) started = true;
    };
    const updateVisibility = () => { hidden = document.hidden; };
    updatePreference();
    updateVisibility();

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reducedMotion) started = true;
    }, { threshold: 0.35 });
    observer.observe(frame);
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      observer.disconnect();
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  });
</script>

<figure>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this figure horizontally.) -->
  <div
    bind:this={frame}
    class="diagram-scroll"
    class:animate={started && !reducedMotion}
    class:paused={!visible || hidden}
    tabindex="0"
    role="region"
    aria-label="Two runs of the same request with different reply timing"
  >
    <svg class="diagram" viewBox="0 0 640 250" role="img" aria-labelledby="timing-title timing-desc">
      <title id="timing-title">The same request, two outcomes</title>
      <desc id="timing-desc">In the first run, the reply arrives before the timeout and the request succeeds. In the second, the timeout happens first and the reply arrives too late. The animation illustrates event order, not measured timings.</desc>
      <defs>
        <marker id="timing-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M1 1 9 5 1 9" />
        </marker>
      </defs>

      <path class="axis" d="M110 82H488" marker-end="url(#timing-arrow)" />
      <path class="axis" d="M110 180H488" marker-end="url(#timing-arrow)" />
      <path class="deadline" d="M355 47V212" />
      <text class="small deadline-label" x="355" y="32" text-anchor="middle">timeout</text>

      <text x="16" y="88">run 1</text>
      <text x="16" y="186">run 2</text>
      <circle class="start" cx="110" cy="82" r="4" />
      <circle class="start" cx="110" cy="180" r="4" />
      <text class="small" x="110" y="111" text-anchor="middle">request</text>
      <text class="small" x="110" y="209" text-anchor="middle">request</text>

      <path class="progress early-progress" d="M110 82H245" />
      <circle class="reply reply-early" cx="245" cy="82" r="5" />
      <text class="small" x="245" y="111" text-anchor="middle">reply</text>

      <path class="progress late-progress" d="M110 180H430" />
      <circle class="reply reply-late" cx="430" cy="180" r="5" />
      <text class="small" x="430" y="209" text-anchor="middle">late reply</text>
      <path class="timeout-hit" d="M349 174 361 186M361 174 349 186" />

      <g class="result-success">
        <rect x="510" y="60" width="112" height="44" />
        <text x="566" y="88" text-anchor="middle">success</text>
      </g>
      <g class="result-timeout">
        <rect x="510" y="158" width="112" height="44" />
        <text x="566" y="186" text-anchor="middle">timeout</text>
      </g>
    </svg>
  </div>
  <figcaption>Reply timing is an input, too.</figcaption>
</figure>

<style>
  svg {
    --evidence: #8daab9;
    --pass: #81b29b;
    --failure: #cf8078;
    --unknown: #c5ae6a;
    color: var(--fg);
  }

  text { fill: currentColor; font-family: monospace; font-size: 17px; }
  .small { font-size: 14px; }
  rect, path, circle { fill: none; stroke: currentColor; stroke-width: 1.3; }
  .axis { opacity: 0.45; }
  .deadline { stroke: var(--unknown); stroke-dasharray: 4 5; }
  .deadline-label { fill: var(--unknown); }
  .progress, .reply { stroke: var(--evidence); }
  .reply { fill: var(--bg); }
  .start { fill: var(--bg); }
  .early-progress { stroke-dasharray: 135; }
  .late-progress { stroke-dasharray: 320; }
  .result-success rect { stroke: var(--pass); }
  .result-timeout rect, .timeout-hit { stroke: var(--failure); }

  /* A single, short pass. The unanimated state always shows the complete story. */
  .animate .reply-early { animation: early-travel 1.6s linear both; }
  .animate .early-progress { animation: early-line 1.6s linear both; }
  .animate .reply-late { animation: late-travel 3.8s linear both; }
  .animate .late-progress { animation: late-line 3.8s linear both; }
  .animate .result-success rect { animation: emphasize 0.15s linear 1.6s both; }
  .animate .result-timeout rect, .animate .timeout-hit { animation: emphasize 0.15s linear 2.91s both; }
  .paused :is(.reply, .progress, .result-success rect, .result-timeout rect, .timeout-hit) {
    animation-play-state: paused;
  }

  @keyframes early-travel { from { transform: translateX(-135px); } to { transform: translateX(0); } }
  @keyframes late-travel { from { transform: translateX(-320px); } to { transform: translateX(0); } }
  @keyframes early-line { from { stroke-dashoffset: 135; } to { stroke-dashoffset: 0; } }
  @keyframes late-line { from { stroke-dashoffset: 320; } to { stroke-dashoffset: 0; } }
  @keyframes emphasize { from { stroke-opacity: 0.2; } to { stroke-opacity: 1; } }

  @media (prefers-color-scheme: light) {
    svg { --evidence: #52778c; --pass: #347763; --failure: #b34d48; --unknown: #947322; }
  }

  @media (prefers-reduced-motion: reduce) {
    .animate :is(.reply, .progress, .result-success rect, .result-timeout rect, .timeout-hit) { animation: none; }
  }
</style>
