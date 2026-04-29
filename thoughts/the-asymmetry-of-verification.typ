#import "../_layout.typ": *

#thought(
  title: "the asymmetry of verification",
  description: "verification is the bottleneck for agentic coding",
  date: "January 2026",
)[
  #elem("p")[There's a concept known as the #link("https://www.jasonwei.net/blog/asymmetry-of-verification-and-verifiers-law", [asymmetry of verification]). Some things are way easier to check than to create.]
  #elem("p")[Sudoku takes forever to solve but two seconds to verify. A product takes engineers years to build, but any person can tell you it's broken.]
  #elem("p")[This idea coupled with agentic coding has changed how I think about building software.]
  #elem("p")[Building software is roughly 50/50 between writing code and verifying it works. But verification is where all the unexpected complexity lives. Edge cases, integration, #link("https://www.youtube.com/shorts/VRXi7ytV290", [the gap]) between how consumers use software vs how it was intended to be used.]
  #elem("p")[A close friend has been working on formal verification - using mathematical proofs to verify code correctness applied to reinforcement learning and LLM training. A specialized solution for mission critical backend code.]
  #elem("p")[Now we have agents that write code faster than most humans. How do I apply the same principles to scaled agentic development in a startup? Where I can let an agent loose on tasks and kick off a complete build-verify-build cycle?]
  #elem("p")[That's where CLIs like Claude Code, Codex, and Opencode come in. Agents embedded in your terminal that approach this loop the same way you and I would - run code, check if it works, fix it if it doesn't.]
  #elem("p")[Frameworks like #link("https://www.sebastiansigl.com/blog/beyond-autocomplete-agentic-coding-1/#:~:text=Image%3A%20IPEV%20Cycle%20diagram%20showing,Ideate%2C%20Plan%2C%20Execute%2C%20and%20Verify", [IPEV]) discovered this loop early. Since it's easy to run code against tests and linters, you'd think you can use this for pretty much anything.]
  #elem("p")[No.]
  #elem("p")[Run an isolated claude instance on a mildly nuanced task and you usually see one of two things. Either the agent gathers context well, uses subagents for heavy lifting, and saves its window for verification. Or it spams grep, fills its context with noise, and when it tries to run tests it bloats even more and turns into a slop machine.]
  #elem("p")[But even when you win, you lose. AI doesn't think about code the same way we do. To us, coding is a craft. To an agent, it just has to get the job done and the evals to compile.]
  #elem("p")[In my experience, the choice of library and packages is a big decider on output quality. Use a random library nobody's heard of and claude will pull from training data on other packages that go against the library's patterns. Why fight the model's trained habits? There is such thing as over-prompting.]
  #elem("p")[Not every piece of code needs the same level of verification. A database migration doesn't need the same scrutiny as a visual tsx component update. Payment and auth code gets near-zero tolerance. Frontend components get visual regression only. Glue code just needs type safety.]
  #elem("p")[The insight: encode these zones in a way agents can read. A verification config that declares intensity levels per directory so the agent adjusts its own rigor based on where it's working.]
  #elem("p")[You can't let your main agent bloat its window with every test run and linter output. I've been running verification agents in parallel with build agents - a critic giving insights from a level of abstraction the main agent doesn't have. This improves impact while preserving the main agent's context.]
  #elem("p")[I also wrote a logger that appends linter output to my CLAUDE.md in single-line patterns. This helped the agent learn what crafted vs produced code looks like and hugely improved output over 2-3 days.]
  #elem("p")[Anthropic showed a 39% improvement in performance by clearing irrelevant tool results from long-running claude instances. I call this context thawing - dynamically editing the agent's context to improve output. An agent whose sole purpose is to control what the main agent sees. Currently writing an opencode plugin for this.]
  #elem("p")[Static evals have a ceiling. You encode rules once and they freeze while your codebase evolves. But patterns emerge that you wouldn't think to write: "functions over 40 lines in /core always get split before merge," "inline styles get rejected 80% of the time," "nested ternaries never survive review." Weighted rules. The eval system develops opinions you didn't program.]
  #elem("p")[That's how you get from opinionated linter to a linter that encodes your taste.]
  #elem("p")[Right now humans write code and machines verify. We're inverting that - machines write code, humans verify.]
  #elem("p")[But if verification itself becomes learned and automated, what's left for humans?]
  #elem("p")[Taste. Deciding what to build. The craft moves up a level of abstraction.]
]
