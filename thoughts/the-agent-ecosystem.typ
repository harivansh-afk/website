#import "../_layout.typ": *

#thought(
  title: "an ecosystem of agents",
  description: "why one agent doesn't cut it",
  date: "February 2026",
)[
  #elem("h2")[a stateless function in a context loop]

  #elem("p")[I wrote about #link("/thoughts/isolated-long-running-agents-with-kubernetes", [the agent environment]) 25 days ago. The premise was simple - an AI agent is a stateless function wrapped in a context loop. It reads, it acts, it forgets. If you want it to do anything real you need to give it somewhere to live. Not a chat window. An actual environment. Persistent storage, network access, tools, a filesystem it can come back to.]
  #elem("p")[That article was about the infrastructure. Kubernetes. Isolated sandboxes. Stateful workspaces that stay on.]
  #elem("p")[This one is about what happens when people start using them.]

  #elem("hr")
  #elem("h2")[we built the infrastructure in 3 days]

  #elem("p")[Recently advait and i built a system called companion-cloud. First version took us 3 days working 18 hours a day. We managed cpu, filesystems, network, process mounting, security, token refresh - all from the ground up, all in golang.]
  #elem("p")[Two people. Three days. The output of a team of 5-10.]
  #elem("p")[Productivity like that isn't possible without obsession with your craft. The tools i used this week look wildly different from the ones i used last week. Laughably so. That pace of change is the point - you have to be willing to throw away your entire workflow every few days if something better exists.]
  #elem("p")[But building the infrastructure was only half the problem.]

  #elem("hr")
  #elem("h2")[the environment is the product]

  #elem("p")[The sandbox isn't just where the agent runs. It's where the agent grows.]
  #elem("p")[When a sandbox is always on, always yours, tied to your files and your context - the agent stops being something you invoke. It becomes something that accumulates. Your preferences. Your patterns. Your half-finished projects. Every interaction leaves residue and that residue is the whole point.]
  #elem("p")[Most AI products skip this. They give you capability and reset it every session. Bad advice? No cost. Misunderstands you? Starts over. Nothing compounds. Including the responsibility.]
  #elem("p")[That's the real problem. Not capability. Continuity.]

  #elem("hr")
  #elem("h2")[why one agent doesn't work]

  #elem("p")[I have a school life. I have a work life. I have side projects. Health stuff. Each one has its own tools, its own context, its own set of things i care about.]
  #elem("p")[Running all of that through a single agent with a single context doesn't make sense.]
  #elem("p")[What makes sense is isolated sandboxes. An agent for school that has browser access, my course materials, my notes. An agent for work that's plugged into Linear and GitHub and my team's docs. An agent for personal projects with its own dev environment and its own memory of what i was building last week.]
  #elem("p")[Each one isolated. Each one stateful. Each one growing independently the more i use it.]
  #elem("p")[That's what an agent ecosystem actually is. Not one agent that does everything. Many agents, each one embedded in a specific part of your life, each one getting better at that one thing over time.]

  #elem("hr")
  #elem("h2")[interfaces are the wrong abstraction]

  #elem("p")[Here's where most people get stuck. They look at AI tools and see the interface - the chat window, the webapp, the sidebar. But those interfaces are nothing more than a way to wrap the underlying API and provide a human-friendly way to interact with it.]
  #elem("p")[In the consumer market this means dumbing it down as much as possible, assuming the end user is a human who needs guardrails and hand-holding.]
  #elem("p")[But if we take a step back and build the environment first - the persistent sandbox, the stateful workspace, the always-on infrastructure - then the interface can be anything. A webapp. Telegram. Slack. Whatever you already use.]
  #elem("p")[You message your work agent from your phone while walking to class. It pulls up the PR you were looking at last night. Your school agent pings you a reminder about a deadline it found in your syllabus. Your personal agent is running a long build in the background and texts you when it's done.]
  #elem("p")[The sandbox is alive. The state is there. The relationship is continuous.]

  #elem("hr")
  #elem("h2")[companion]

  #elem("p")[I've been building this for 25 days. It's called #link("https://os.companion.ai", [Companion]).]
  #elem("p")[You sign up. You get an instant sandbox. A private virtual computer for your AI to live in. Persistent storage. Always on. Always yours.]
  #elem("p")[We handle the servers, the storage, the infrastructure. You bring the intent.]
  #elem("blockquote")[an AI bound to one human as its primary principal. memory, actions, and decisions aligned to its human's long-term interests.]
  #elem("p")[This works well for delegating specialized tasks in isolated secure environments. Debugging a user's sandbox in real time as they send a support email. Running long background jobs. Managing context across sessions. The kind of stuff that falls apart the second your agent loses its memory.]

  #elem("hr")
  #elem("h2")[why this matters]

  #elem("p")[Human morality rarely begins as an abstract love for all humanity. It begins with someone specific. Your kid, your partner, your team.]
  #elem("p")[Through concrete responsibility, care expands.]
  #elem("p")[AI should develop the same way. A companion shaped by one human life over time. When an AI learns one person's values and boundaries and long-term goals, it starts to develop something closer to genuine responsibility.]
  #elem("p")[An AI that cares for one human life is more likely to care for humanity itself.]
  #elem("p")[Capabilities are accelerating faster than anyone expected. Most alignment work focuses on training and evals and guardrails. All necessary. All insufficient on their own.]
  #elem("p")[How AI relates to humans will shape what it becomes.]
  #elem("p")[That's my bet on what that relationship should look like.]
  #elem("p")[#link("https://os.companion.ai", [os.companion.ai])]
]
