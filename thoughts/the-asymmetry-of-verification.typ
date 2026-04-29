#import "../_layout.typ": *

#thought(
  title: "the asymmetry of verification",
  description: "the asymmetry of verification",
  date: "January 2026",
)[
  #elem("p")[The Only Limit is What You Can Verify. There's a concept known as the #link("https://www.jasonwei.net/blog/asymmetry-of-verification-and-verifiers-law", [asymmetry of verification])]
  #elem("p")[The idea is that some things are way easier to check than to create.]

  #elem("ul")[
    #item([Sudoku takes forever to solve but two seconds to verify.])
    #item([A consumer product takes engineers years to build, but any random person can tell you it's broken.])
  ]

  #elem("p")[This idea coupled with agentic coding has began to change how I think about building software.]
  #elem("p")[Building software is roughly a 50/50 split between writing code and verifying that it works as intended.]
  #elem("p")[But verification is where all the unexpected complexity lives. Edge cases. Integration. Nuances that arent second nature.]
  #elem("p")[#link("https://www.youtube.com/shorts/VRXi7ytV290", [The gap]) between the way consumers use a piece of software vs how it was intended to be used.]

  #elem("h2")[Agent-led programming]

  #elem("p")[A close friend of mine has been working on a concept known as FV (formal verification). Using mathematical proofs to verify code correctness applied to reinforcement learning and the training of Large Language Models.]
  #elem("p")[This is great.]
  #elem("p")[A specialized solution for mission critical backend code.]
  #elem("p")[Now we have agents that can write code faster and better than most humans, how can I apply the same principles to scaled agentic software development in a startup environment?]
  #elem("p")[Where i can let an agent loose on a set of tasks and be able to kick off a complete build > verify > build cycle while avoiding the common pitfalls of ai coding?]
  #elem("p")[Thats where cool CLIs like Claude Code, Codex, and Opencode come in.]
  #elem("p")[Agents that are embedded deeply inside your computer - that live in your terminal.]
  #elem("p")[They have the capability to approach this loop the same way that you and I would.]
  #elem("p")[These agents have the ability to run their own code, check if it works and fix it if it doesnt/continue if it does.]
  #elem("p")[Frameworks like #link("https://www.sebastiansigl.com/blog/beyond-autocomplete-agentic-coding-1/#:~:text=Image%3A%20IPEV%20Cycle%20diagram%20showing,Ideate%2C%20Plan%2C%20Execute%2C%20and%20Verify", [IPEV]) discovered this loop early.]
  #elem("p")[Since its pretty easy to to let a coding agent run your code against tests and linters, you can use this loop to run the build > verify > build cycle for pretty much anything right?]
  #elem("p")[no.]
  #elem("p")[Have you tried to run an isolated claude instance on a mildly nuanced task?]
  #elem("p")[If yes, you usually see one of two things happen:]

  #elem("ul")[
    #item([The agent is smart enough to gather the right context and approach the task the correct way. It uses subagents to do the heavy context work and saves its window for the verification phase.])
    #item([The agent spams grep, fills up its context window with irrelevant information, and when i tries to run tests it bloats its window even more and turns into a slop machine thats thinks "youre absolutely right"])
  ]

  #elem("blockquote")[EntityDiagram visual omitted in this Typst port.]

  #elem("p")[But even when you win. You lose.]
  #elem("p")[This is because ai doesnt think about code the same way as humans do.]
  #elem("p")[To us, coding is a craft. Developers spend enormous amounts of time perfecting code that will have little to no impact on the end user.]
  #elem("p")[But to an agent, it just has to get the job done and the evals to compile.]

  #elem("h2")[Harness engineering]

  #elem("p")[Coding agents = User Interface + Model + Harness]
  #elem("p")[In my experience with coding agents like claude, the choice of library and packages is often a big decider on how good the output is going to be.]
  #elem("p")[If you try to use a random ass library from a million years ago that no ones ever heard about, chances are that claude wont know how to use it and will try to pull from the context of its training data on other packages that may go against the libraries patterns.]
  #elem("p")[Why fight the model's trained habits?]
  #elem("p")[Leaning into the habbits that these models develop from their training data usually leads to better output.]
  #elem("p")[ie. yes. there is such thing as "over-prompting"]
  #elem("p")[There is a counter-argument to this as well. Companies like Letta argue that memory is the answer to this.]
  #elem("p")[Till they figure it out im just gonna have to depend on libraries that claude has been trained on.]
  #elem("p")[The first result continues to get better as companies like anthropic introduce more sophisticated APIs for their models.]
  #elem("p")[Things like having the ability to edit context programatically (via an agent) will drive huge improvements in the quality of code output.]

  #elem("h2")[Verfication of brown-field codebases]

  #elem("p")[Have you ever wondered how large consumer products like instagram and tiktok ensure that a 50 line PR doesnt break prod for a billion users?]
  #elem("p")[This is done through years of evaluation engineering and creation of systems that fail unless the code is perfect.]
  #elem("p")[The important nuance to this process is that not every piece of code needs the same level of verification.]
  #elem("p")[A database migration doesnt need the same amounf of verification as a visual tsx component update.]
  #elem("p")[Your codebase should encode verification intensity by zone:]

  #elem("ul")[
    #item([Payment/auth code: Near-zero tolerance, exhaustive property-based testing])
    #item([Frontend components: Higher creativity tolerance, visual regression only])
    #item([Glue code: Medium—type safety sufficient])
  ]

  #elem("blockquote")[ArchitectureDiagram visual omitted in this Typst port.]

  #elem("p")[This isn't new, but the insight is: encode these zones in a way agents can read.]
  #elem("p")[A verification.yaml that declares intensity levels per directory. The agent adjusts its own verification rigor based on where it's working.]

  #elem("h2")[Context efficiency]

  #elem("p")[An important thing to consider with verification is context]
  #elem("p")[You obviously cant let your main agent bloat its window with each test that is run and all the output from my linters.]
  #elem("p")[Its simply too much context.]
  #elem("p")[To solve this, I've been experimenting with a few different approaches:]

  #elem("ul")[
    #item([Parallelized verification - I've been running the verification agents in parallel with the build agents. This has let do improvements in code quality as well as shipping speed. If i can get a 'critic' agent to give me insights from a level of abstraction that my main agent doesnt have access to. I can improve the overall impact that my code has on the codebase while preserving the context that my main agent consumes.])
    #item([Centralized memory - I wrote a simple logger that appends the output of the linters and evals to my CLAUDE.md file in a single line explaining what what pattern to follow the next time it comes across the same problem. This approach helped the main agent gain more understanding of what crafted vs produced code looks like and hugely improved output over 2-3 days of usage.])
  ]

  #elem("blockquote")[FlowDiagram visual omitted in this Typst port.]

  #elem("h3")[Context thawing]

  #elem("p")[Anthropic studies showed a 39% imporvement in performance by simply clearling irrelevant tool results from the context windows of long running isolated claude code instances.]
  #elem("p")[I like to call this 'context thawing' : the ability to dynamically edit the context of the main coding agent to improve output quality.]
  #elem("p")[There is no way to do this with claude yet (that ive seen) so opencode is the only viable option for now.]
  #elem("p")[The idea is that you have an agent instance whose sole purpose is to edit and control the context of the main coding agent. It has access to all the tool calls made by the main agent in a compacted fashion and dynamically inserts and removes files etc from the agent's window.]
  #elem("p")[Currently writing an opencode plugin for this. more on that soon.]

  #elem("h2")[Learning verification]

  #elem("p")[Static evals have a ceiling. You encode rules once, and they stay frozen while your codebase evolves and your taste refines.]
  #elem("p")[The patterns that emerge aren't ones you'd think to write:]
  #elem("p")["Functions over 40 lines in /core always get split before merge" "Inline styles in components get rejected 80% of the time" "Nested ternaries never survive review"]
  #elem("p")[These become weighted rules. The eval system develops opinions you didn't explicitly program.]
  #elem("p")[This is how you get from "opinionated linter" to "linter that encodes my taste"]

  #elem("h2")[The 'flip']

  #elem("p")[Right now humans write code and machines verify (linters, tests).]
  #elem("p")[We're inverting that—machines write code, humans verify.]
  #elem("p")[But if verification itself becomes learned and automated, what's left for humans?]
  #elem("p")[Taste.]
  #elem("p")[Deciding what to build.]
  #elem("p")[The craft moves up a level of abstraction.]
]
