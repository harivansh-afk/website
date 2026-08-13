<script>
  const title = "the self-cleaning codebase";
  const description =
    "let the codebase clean itself: docs, opinions, and agents on a cadence";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Harivansh Rathi" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="https://harivan.sh/thoughts/" />
  <meta property="og:image" content="https://harivan.sh/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Harivansh Rathi - distributed systems and ai computers" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://harivan.sh/og.png" />
</svelte:head>

<main class="thought">
  <nav><a href="/" class="back-link">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">June 2026</p>
    </header>
    <p>Sooo, is your codebase rotting?</p>
    <p>Is the slop winning?</p>
    <p>The fallback that should have been a typed error, the helper copy-pasted 11 times instead of canonical, the abstraction that technically works but reads like a pile of shit.</p>
    <p>The usual advice is to review harder and read the code, which is funny, because the entire reason you spent an hour speccing was to not have to review the diff.</p>
    <p>And to be clear, none of this is about correctness.</p>
    <p>The code works: it passes the tests, it passes Antithesis assertions for prod fault injection, it even handles all the layered edge cases.</p>
    <p>It’s just ugly. And it compounds.</p>
    <p>It teaches the next agent the wrong patterns, and no test will ever catch it.</p>
    <p>So we hedged our bet. Instead of spending all day reviewing slop and yelling at claude, we let the codebase clean itself.</p>
    <p>Bad patterns can be detected and fixed automatically on a cadence if you just pay attention. You could be waking up to a stack of small merged PRs nudging the code toward the way its supposed to look.</p>
    <div class="callout"><div class="callout-label"><span>aside</span></div><p>There is no magic and its not about a tool that will solve all your problems. So if thats what you’re here for, leave now or forever hold your peace.</p></div>
    <p>This only works if your codebase is legible to the agents in the first place so they know how the code is meant to look before they can fix code that doesn’t.</p>
    <h2>codebase legibility</h2>
    <p>Before any automation, an agent needs two things:</p>
    <p>a map of the repo, and an opinion about how things are done in each language.</p>
    <p>We thought a lot about how to do docs effectively, and it really comes down to one decision: what do you want the docs to <em>mean</em>?</p>
    <p>Most doc systems never answer this, so they sprawl into a shitty <em>second codebase</em> that drifts out of date and ends up confusing agents by holding out of date information.</p>
    <p>For us, I wanted the docs to be the first place an agent looks before invoking the <em>rg</em> tool. This is not supposed to be complete reference, its only the <em>entry point</em>.</p>
    <p>Just enough context for the agent to orient itself and then go do deeper exploration in the actual source. Read the page, know where you are, know what this thing is responsible for, then dive in with ripgrep.</p>
    <p>That means the structure is boring on purpose. One doc tree shaped like the package tree. A root <code>index.md</code> that is a dispatch table, one directory per package with an <code>overview.md</code>, and the bigger packages split into a couple of concern pages or nested with subdirs.</p>
    <div class="filetree"><div class="ft-row" style="padding-left: 0rem"><span class="ft-name">docs/</span></div><div class="ft-row" style="padding-left: 1.25rem"><span class="ft-name">index.md</span> <span class="ft-note">one-row-per-package catalog</span></div><div class="ft-row" style="padding-left: 1.25rem"><span class="ft-name">edit-applier/</span></div><div class="ft-row" style="padding-left: 2.5rem"><span class="ft-name">overview.md</span></div><div class="ft-row" style="padding-left: 1.25rem"><span class="ft-name">search-core/</span></div><div class="ft-row" style="padding-left: 2.5rem"><span class="ft-name">overview.md</span></div><div class="ft-row" style="padding-left: 2.5rem"><span class="ft-name">internals.md</span> <span class="ft-note">concern page for a big package</span></div><div class="ft-row" style="padding-left: 1.25rem"><span class="ft-name">symphony/</span></div><div class="ft-row" style="padding-left: 2.5rem"><span class="ft-name">overview.md</span> <span class="ft-note">architecture + load-bearing invariants</span></div><div class="ft-row" style="padding-left: 2.5rem"><span class="ft-name">dsl/</span></div><div class="ft-row" style="padding-left: 3.75rem"><span class="ft-name">overview.md</span></div><div class="ft-row" style="padding-left: 2.5rem"><span class="ft-name">engine/</span></div><div class="ft-row" style="padding-left: 3.75rem"><span class="ft-name">overview.md</span></div><div class="ft-row" style="padding-left: 3.75rem"><span class="ft-name">contract.md</span></div></div>
    <h2>forming opinions</h2>
    <p>Here’s the failure everyone hits with spec-driven agents.</p>
    <p>You write a careful spec, the agent follows it to the letter, the behavior is correct, and then you zoom in on the abstractions and it’s spaghetti. Right answers, reached through structures you’d never write.</p>
    <p>A spec says <em>what the code does</em>. It says almost nothing about <em>how the code is shaped</em>.</p>
    <p>That gap is filled by opinions, and they have to be concrete and language-level, not vibes.</p>
    <p>For Rust that’s things like: errors go through <code>snafu</code> and preserve their source, never <code>anyhow</code> or <code>Result&lt;_, String></code>; no <code>unwrap</code>/<code>expect</code> in library code; how you expect borrows and mutability to flow; when an <code>impl</code> block earns its keep and when it doesn’t.</p>
    <p>And this is the part people get twitchy about: once you can have genuinely opinionated codebases, you can start to step away from reading every line of code (don’t flame me for this).</p>
    <p>The opinions become the thing that keeps output looking like <em>you</em> wrote it, which is exactly what frees you from having to confirm it line by line.</p>
    <h2>deterministically bad behavior</h2>
    <p>Once you have opinions, you finally have something to measure against.</p>
    <p>Now you can watch what your agents actually do and start writing down the recurring ways they produce slop.</p>
    <p>Each one gets a name.</p>
    <p>That list of named anti-patterns is the whole raw material for what comes next.</p>
    <p>Every bad behavior becomes a single skill, a tight deterministic cleanup for exactly that pattern, with all the house context baked in.</p>
    <p>Then something runs each skill on a schedule sized to the behavior, hourly for the noisy ones, weekly for the structural ones.</p>
    <p>We run that on <a href="https://github.com/indexable-inc/index/tree/main/packages/agent/symphony" target="_blank" rel="noopener noreferrer"><code>symphony</code></a>, which we’ve open-sourced.</p>
    <p>It’s a boring DAG runtime for deterministic agent workflows, and boring is the point.</p>
    <p>It’s Elixir on the BEAM, which buys two things that matter here: OTP supervision, so a crashed run gets recovered instead of silently lost, and cheap distribution, so runs fan out across machines.</p>
    <p>Each run gets its own git checkout, runs a headless agent (Claude, e.g. <code>claude-opus-4-8</code>, or 5.5 gpt) under a bot identity on git, and opens a PR.</p>
    <h2>merge in CI</h2>
    <p>These cleanup PRs are tiny, ten to twenty lines, and they merge without me looking at them.</p>
    <p>The obvious question is why you’d ever trust that.</p>
    <p>The answer is that every PR has to pass a structural rule set that encodes exactly how we like our languages to look, and the agent that wrote the PR already had all of that context going in.</p>
    <p>Small diff, pre-aligned with the rules, lands clean.</p>
    <p>Those rules run on our own DSL, <a href="https://github.com/indexable-inc/index/tree/main/astlog-rules" target="_blank" rel="noopener noreferrer"><code>astlog</code></a>, which replaced ast-grep.</p>
    <p>We built it for a specific reason.</p>
    <p>Pattern tools (ast-grep, Semgrep, tree-sitter queries) answer “does this node match this shape.”</p>
    <p>But the rules you actually want during cleanup are <em>joins</em>: an <code>unwrap()</code> inside a function that returns <code>Result</code>, or a value read from an attribute you just checked for existence.</p>
    <p>It runs the same way everywhere:</p>
    <p>the same <code>astlog scan</code> in the pre-commit hook and in CI, suppressions need an inline <code>astlog-ignore</code> you can audit later, and every rule ships a good/bad fixture pair so the rules themselves are tested.</p>
    <p>Which is the real point of astlog: it is not a bug-finder. Correctness is a different axis, already covered by tests and Antithesis. astlog only enforces shape.</p>
    <p>So the loop closes.</p>
    <p>The agent writes against the opinions, the gate enforces the opinions, and a ten-line cleanup either passes clean or gets bounced with a precise reason.</p>
    <p>That’s what makes “merge it without me” a sane thing to say out loud.</p>
  </article>
</main>
