#import "../_layout.typ": *

#thought(
  title: "the self-cleaning codebase",
  description: "let the codebase clean itself: docs, opinions, and agents on a cadence",
  date: "June 2026",
)[
  #elem("p")[Nobody warns you about this when you start abusing coding agents- your codebase rots faster than it ever did.]
  #elem("p")[The agents are fast and the slop is too. The fallback that should have been a typed error, the helper copy-pasted 11 times instead of canonical, the abstraction that technically works but reads like a pile of shit. The usual advice is to review harder and read the code, which is funny, because the entire reason you spent an hour speccing was to not have to read the diff.]
  #elem("p")[So we hedged our bet. Instead of spending all day reviewing slop and yelling at claude, we let the codebase clean itself] 
  #elem("p")[Bad patterns can be detected and fixed automatically on a cadence if you just pay attention. You could be waking up to a stack of small merged PRs nudgeding the code toward the way its supposed to look.]

  #callout(kind: "warning")[
    #elem("p")[There is no magic and its not about a tool that will solve all your problems. So if thats what you're here for, leave now or forever hold your peace.]
  ]
  #elem("p")[This only works if your codebase is legible to the agents in the first place so they know how the code is meant to look before they can fix code that doesn't.]
  #elem("p")[Everything below is how we built that on using a simple erlang stack and its here for you to use #link("https://github.com/indexable-inc/index/tree/main/packages/agent/symphony")[`symphony`]]

  #elem("hr")
  #elem("h2")[making the codebase legible]

  #elem("p")[Before any automation, an agent needs two things: ]
  #elem("p")[a map of the repo, and an opinion about how things are done in each language.]

  #elem("p")[We thought a lot about how to do docs effectively, and it really comes down to one decision: what do you want the docs to _mean_?]
  #elem("p")[Most doc systems never answer this, so they sprawl into a shitty _second codebase_ that drifts out of date and ends up confusing agents by holding out of date information.]
  #elem("p")[For us, I wanted the docs to be the first place an agent looks before invoking the _rg_ tool. This is not supposed to be complete reference, its only the _entry point_] 
  #elem("p")[Just enough context for the agent to orient itself and then go do deeper exploration in the actual source. Read the page, know where you are, know what this thing is responsible for, then dive in with ripgrep.]
  #elem("p")[That means the structure is boring on purpose. One doc tree shaped like the package tree. A root `index.md` that is a dispatch table, one directory per package with an `overview.md`, and the bigger packages split into a couple of concern pages or nested with subdirs.]

  ```text
  docs/
    index.md                 # one-row-per-package catalog
    edit-applier/overview.md
    search-core/
      overview.md
      internals.md           # concern page for a big package
    symphony/
      overview.md            # architecture + the load-bearing invariants
      dsl/overview.md
      engine/overview.md     # engine subdir
            /contract.md
  ```

  #elem("p")[And the content is deliberately thin: clean, concise docs that explain only the expectation for that piece of code, crate, or package. Nothing more. No API dumps, no tutorials, no restating what the types already say. What earns a place on the page is the stuff an agent can't infer and will otherwise break: the invariants and the gotchas. The `edit-applier` page, for example, says one load-bearing thing: _sort, then `check_overlaps`, then `apply`, in that order._ Every claim cites a real `path:line` back into the source, which is also how the docs stay honest without a generator: if the citation is wrong, it's obvious.]
  #elem("p")[This is why mirroring the code beats one giant `ARCHITECTURE.md`. An agent touching one package loads one small page instead of blowing its context window on a monolith, the lookup from open file to relevant doc is mechanical, and the contracts live right next to the code they constrain.]

  #elem("h2")[opinions are the house style]

  #elem("p")[Here's the failure everyone hits with spec-driven agents. You write a careful spec, the agent follows it to the letter, the behavior is correct, and then you zoom in on the abstractions and it's spaghetti. Right answers, reached through structures you'd never write.]
  #elem("p")[A spec says _what the code does_. It says almost nothing about _how the code is shaped_. That gap is filled by opinions, and they have to be concrete and language-level, not vibes. For Rust that's things like: errors go through `snafu` and preserve their source, never `anyhow` or `Result<_, String>`; no `unwrap`/`expect` in library code; how you expect borrows and mutability to flow; when an `impl` block earns its keep and when it doesn't.]
  #elem("p")[And this is the part people get twitchy about: once you can have genuinely opinionated codebases, you can start to step away from reading every line of code (don't flame me for this \@dexhorthy). The opinions become the thing that keeps output looking like _you_ wrote it, which is exactly what frees you from having to confirm it line by line.]

  #elem("hr")
  #elem("h2")[turn bad behavior into a list, then into skills]

  #elem("p")[Once you have opinions, you finally have something to measure against. Now you can watch what your agents actually do and start writing down the recurring ways they produce slop. Each one gets a name. That list of named anti-patterns is the whole raw material for what comes next.]
  #elem("p")[The shape is dead simple: one behavior, one skill, one cadence.]
  #elem("p")[Every bad behavior becomes a single skill, a tight deterministic cleanup for exactly that pattern, with all the house context baked in. Then something runs each skill on a schedule sized to the behavior, hourly for the noisy ones, weekly for the structural ones.]
  #elem("p")[We run that on #link("https://github.com/indexable-inc/index/tree/main/packages/agent/symphony")[`symphony`], which we've open-sourced. It's a boring DAG runtime for deterministic agent workflows, and boring is the point. It's Elixir on the BEAM, which buys two things that matter here: OTP supervision, so a crashed run gets recovered instead of silently lost, and cheap distribution, so runs fan out across machines.]
  #elem("p")[A run looks like this:]

  ```text
  ╭─────────────────────────────────────────────────╮
  │ cron trigger  ·  GenServer poll, 60s tick       │
  ╰─────────────────────────────────────────────────╯
                           │
                           ▼
  ╭─────────────────────────────────────────────────╮
  │ ingress  ·  materialize workflow into a run DAG │
  ╰─────────────────────────────────────────────────╯
                           │
                           ▼
  ╭─────────────────────────────────────────────────╮
  │ placement  ·  microVM, host, or remote worker   │
  ╰─────────────────────────────────────────────────╯
                           │
                           ▼
  ╭─────────────────────────────────────────────────╮
  │ agent turn  ·  Claude or Codex runs the skill   │
  ╰─────────────────────────────────────────────────╯
                           │
                           ▼
  ╭─────────────────────────────────────────────────╮
  │ small PR opened under a bot identity            │
  ╰─────────────────────────────────────────────────╯
                           │
                           ▼
  ╭─────────────────────────────────────────────────╮
  │ verification gate (next section)                │
  ╰─────────────────────────────────────────────────╯
  ```

  #elem("p")[Under the hood the cadence is just a small cron parser and a `GenServer` that ticks every 60 seconds, starting one run per workflow whose moment has come (with sane "don't fire ten times because we just redeployed" semantics). Each run gets its own git checkout, runs a headless agent (Claude, e.g. `claude-opus-4-8`, or Codex) under a bot identity, and opens a PR. Where it runs is decided per run: a short-lived microVM, a privilege-dropped unit on the host, or a separate worker box.]
  #elem("p")[The thing I want to stress: none of this is fancy. A runtime that runs your agent in a specific repo on a specific cadence against one well-scoped skill is enough to get genuinely good results.]

  #elem("hr")
  #elem("h2")[the gate that lets the PRs merge themselves]

  #elem("p")[These cleanup PRs are tiny, ten to twenty lines, and they merge without me looking at them. The obvious question is why you'd ever trust that. The answer is that every PR has to pass a structural rule set that encodes exactly how we like our languages to look, and the agent that wrote the PR already had all of that context going in. Small diff, pre-aligned with the rules, lands clean.]
  #elem("p")[Those rules run on our own DSL, #link("https://github.com/indexable-inc/index/tree/main/astlog-rules")[`astlog`], which replaced ast-grep. We built it for a specific reason. Pattern tools (ast-grep, Semgrep, tree-sitter queries) answer "does this node match this shape." But the rules you actually want during cleanup are _joins_: an `unwrap()` inside a function that returns `Result`, or a value read from an attribute you just checked for existence. That's a join across two unrelated parts of the tree, by value, and structural matchers can't express it. astlog runs Datalog over the tree-sitter syntax tree, so the join is one rule.]
  #elem("p")[Here's a real one. It bans file-scope `with lib;` in our Nix:]

  ```lisp
  (rule (no-with-lib n)
    (match nix "
      (with_expression
        environment: (variable_expression) @e) @n")
    (text e "lib"))
  (lint no-with-lib error
    "file-scope `with lib;` is banned; use explicit lib.foo qualifications")
  ```

  #elem("p")[The part ast-grep can't do is the value join: capture `s ? k` in one subtree and `s.k` in another, fire only when they're the same attribute, and rewrite `(s ? k) && <uses s.k>` into `s.k or DEFAULT`. One rule, two unrelated places in the tree, matched by value.]
  #elem("p")[Two things make this load-bearing. First, every rule is one opinion with a fix attached: each `lint` line is the canonical statement of a house-style rule and tells you what to do instead. The ruleset is just the opinions from earlier, made executable (right now: ~94 Nix lints, plus Rust, Cargo, and Elixir). Second, it runs the same way everywhere: the same `astlog scan` in the pre-commit hook and in CI, suppressions need an inline `astlog-ignore` you can audit later, and every rule ships a good/bad fixture pair so the rules themselves are tested.]
  #elem("p")[So the loop closes. The agent writes against the opinions, the gate enforces the opinions, and a ten-line cleanup either passes clean or gets bounced with a precise reason. That's what makes "merge it without me" a sane thing to say out loud.]

  #elem("hr")
  #elem("h2")[the loop]

  #elem("p")[Put the pieces together and it's a cycle, not a pipeline:]

  ```text
  ┌───────────────────────────────────────────────┐
  │ legible codebase  ·  docs + opinions          │ ◀──┐
  └───────────────────────────────────────────────┘    │
                          │                            │
                          ▼                            │
  ┌───────────────────────────────────────────────┐    │
  │ detect recurring bad behavior                 │    │
  └───────────────────────────────────────────────┘    │
                          │                            │
                          ▼                            │
  ┌───────────────────────────────────────────────┐    │
  │ one skill per behavior, run on a cadence      │    │
  └───────────────────────────────────────────────┘    │
                          │                            │
                          ▼                            │
  ┌───────────────────────────────────────────────┐    │
  │ structural gate  ·  astlog in CI + pre-commit │    │
  └───────────────────────────────────────────────┘    │
                          │                            │
                          ▼                            │
  ┌───────────────────────────────────────────────┐    │
  │ auto-merge small clean PRs                    │ ───┘
  └───────────────────────────────────────────────┘
  ```

  #elem("p")[Every lap leaves the codebase a little more aligned with how you said it should look, which makes the next lap cheaper. Entropy still pushes the other way, but now something is pushing back on a timer.]
  #elem("p")[One honest line so I'm not overselling it: this cleans entropy, not architecture. The real design decisions, the ones that need taste and tradeoffs, don't automate away and shouldn't. Self-cleaning keeps the small stuff from compounding into big stuff. It doesn't decide what to build. That's still your job, and now you've got more time for it.]
]
