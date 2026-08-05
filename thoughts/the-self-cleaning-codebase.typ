#import "../_layout.typ": *

#thought(
  title: "the self-cleaning codebase",
  description: "let the codebase clean itself: docs, opinions, and agents on a cadence",
  date: "June 2026",
)[
  #elem("p")[Sooo, is your codebase rotting?]
  #elem("p")[Is the slop winning?]
  #elem("p")[The fallback that should have been a typed error, the helper copy-pasted 11 times instead of canonical, the abstraction that technically works but reads like a pile of shit.]
  #elem("p")[The usual advice is to review harder and read the code, which is funny, because the entire reason you spent an hour speccing was to not have to review the diff.]
  #elem("p")[And to be clear, none of this is about correctness.]
  #elem("p")[The code works: it passes the tests, it passes Antithesis assertions for prod fault injection, it even handles all the layered edge cases.]
  #elem("p")[It's just ugly. And it compounds.]
  #elem("p")[It teaches the next agent the wrong patterns, and no test will ever catch it.]
  #elem("p")[So we hedged our bet. Instead of spending all day reviewing slop and yelling at claude, we let the codebase clean itself.]
  #elem("p")[Bad patterns can be detected and fixed automatically on a cadence if you just pay attention. You could be waking up to a stack of small merged PRs nudging the code toward the way its supposed to look.]

  #callout[
    #elem("p")[There is no magic and its not about a tool that will solve all your problems. So if thats what you're here for, leave now or forever hold your peace.]
  ]
  #elem("p")[This only works if your codebase is legible to the agents in the first place so they know how the code is meant to look before they can fix code that doesn't.]

  #elem("h2")[codebase legibility]

  #elem("p")[Before any automation, an agent needs two things: ]
  #elem("p")[a map of the repo, and an opinion about how things are done in each language.]

  #elem("p")[We thought a lot about how to do docs effectively, and it really comes down to one decision: what do you want the docs to _mean_?]
  #elem("p")[Most doc systems never answer this, so they sprawl into a shitty _second codebase_ that drifts out of date and ends up confusing agents by holding out of date information.]
  #elem("p")[For us, I wanted the docs to be the first place an agent looks before invoking the _rg_ tool. This is not supposed to be complete reference, its only the _entry point_.]
  #elem("p")[Just enough context for the agent to orient itself and then go do deeper exploration in the actual source. Read the page, know where you are, know what this thing is responsible for, then dive in with ripgrep.]
  #elem("p")[That means the structure is boring on purpose. One doc tree shaped like the package tree. A root `index.md` that is a dispatch table, one directory per package with an `overview.md`, and the bigger packages split into a couple of concern pages or nested with subdirs.]

  #filetree[
    #ftrow(0, [docs/])
    #ftrow(1, [index.md], note: [one-row-per-package catalog])
    #ftrow(1, [edit-applier/])
    #ftrow(2, [overview.md])
    #ftrow(1, [search-core/])
    #ftrow(2, [overview.md])
    #ftrow(2, [internals.md], note: [concern page for a big package])
    #ftrow(1, [symphony/])
    #ftrow(2, [overview.md], note: [architecture + load-bearing invariants])
    #ftrow(2, [dsl/])
    #ftrow(3, [overview.md])
    #ftrow(2, [engine/])
    #ftrow(3, [overview.md])
    #ftrow(3, [contract.md])
  ]

  #elem("h2")[forming opinions]

  #elem("p")[Here's the failure everyone hits with spec-driven agents.]
  #elem("p")[You write a careful spec, the agent follows it to the letter, the behavior is correct, and then you zoom in on the abstractions and it's spaghetti. Right answers, reached through structures you'd never write.]
  #elem("p")[A spec says _what the code does_. It says almost nothing about _how the code is shaped_.]
  #elem("p")[That gap is filled by opinions, and they have to be concrete and language-level, not vibes.]
  #elem("p")[For Rust that's things like: errors go through `snafu` and preserve their source, never `anyhow` or `Result<_, String>`; no `unwrap`/`expect` in library code; how you expect borrows and mutability to flow; when an `impl` block earns its keep and when it doesn't.]
  #elem("p")[And this is the part people get twitchy about: once you can have genuinely opinionated codebases, you can start to step away from reading every line of code (don't flame me for this).]
  #elem("p")[The opinions become the thing that keeps output looking like _you_ wrote it, which is exactly what frees you from having to confirm it line by line.]

  #elem("h2")[deterministically bad behavior]

  #elem("p")[Once you have opinions, you finally have something to measure against.]
  #elem("p")[Now you can watch what your agents actually do and start writing down the recurring ways they produce slop.]
  #elem("p")[Each one gets a name.]
  #elem("p")[That list of named anti-patterns is the whole raw material for what comes next.]
  #elem("p")[Every bad behavior becomes a single skill, a tight deterministic cleanup for exactly that pattern, with all the house context baked in.]
  #elem("p")[Then something runs each skill on a schedule sized to the behavior, hourly for the noisy ones, weekly for the structural ones.]
  #elem("p")[We run that on #link("https://github.com/indexable-inc/index/tree/main/packages/agent/symphony")[`symphony`], which we've open-sourced.]
  #elem("p")[It's a boring DAG runtime for deterministic agent workflows, and boring is the point.]
  #elem("p")[It's Elixir on the BEAM, which buys two things that matter here: OTP supervision, so a crashed run gets recovered instead of silently lost, and cheap distribution, so runs fan out across machines.]
  #elem("p")[Each run gets its own git checkout, runs a headless agent (Claude, e.g. `claude-opus-4-8`, or 5.5 gpt) under a bot identity on git, and opens a PR.]

  #elem("h2")[merge in CI]

  #elem("p")[These cleanup PRs are tiny, ten to twenty lines, and they merge without me looking at them.]
  #elem("p")[The obvious question is why you'd ever trust that.]
  #elem("p")[The answer is that every PR has to pass a structural rule set that encodes exactly how we like our languages to look, and the agent that wrote the PR already had all of that context going in.]
  #elem("p")[Small diff, pre-aligned with the rules, lands clean.]
  #elem("p")[Those rules run on our own DSL, #link("https://github.com/indexable-inc/index/tree/main/astlog-rules")[`astlog`], which replaced ast-grep.]
  #elem("p")[We built it for a specific reason.]
  #elem("p")[Pattern tools (ast-grep, Semgrep, tree-sitter queries) answer "does this node match this shape."]
  #elem("p")[But the rules you actually want during cleanup are _joins_: an `unwrap()` inside a function that returns `Result`, or a value read from an attribute you just checked for existence.]
  #elem("p")[It runs the same way everywhere:]
  #elem("p")[the same `astlog scan` in the pre-commit hook and in CI, suppressions need an inline `astlog-ignore` you can audit later, and every rule ships a good/bad fixture pair so the rules themselves are tested.]
  #elem("p")[Which is the real point of astlog: it is not a bug-finder. Correctness is a different axis, already covered by tests and Antithesis. astlog only enforces shape.]
  #elem("p")[So the loop closes.]
  #elem("p")[The agent writes against the opinions, the gate enforces the opinions, and a ten-line cleanup either passes clean or gets bounced with a precise reason.]
  #elem("p")[That's what makes "merge it without me" a sane thing to say out loud.]
]
