<script>
  import Seo from "$lib/Seo.svelte";

  const title = "an ecosystem of agents";
</script>

<Seo {title} description="why one agent doesn't cut it" />

<main class="thought">
  <nav><a href="/" class="back-link">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">February 2026</p>
    </header>
    <h2>a stateless function in a context loop</h2>
    <p>I wrote about <a href="/thoughts/isolated-long-running-agents-with-kubernetes">the agent environment</a> 25 days ago. The premise was simple - an AI agent is a stateless function wrapped in a context loop. It reads, it acts, it forgets. If you want it to do anything real you need to give it somewhere to live. Not a chat window. An actual environment. Persistent storage, network access, tools, a filesystem it can come back to.</p>
    <p>That article was about the infrastructure. Kubernetes. Isolated sandboxes. Stateful workspaces that stay on.</p>
    <p>This one is about what happens when people start using them.</p>
    <hr>
    <h2>we built the infrastructure in 3 days</h2>
    <p>Recently advait and i built a system called companion-cloud. First version took us 3 days working 18 hours a day. We managed cpu, filesystems, network, process mounting, security, token refresh - all from the ground up, all in golang.</p>
    <p>Two people. Three days. The output of a team of 5-10.</p>
    <p>Productivity like that isn’t possible without obsession with your craft. The tools i used this week look wildly different from the ones i used last week. Laughably so. That pace of change is the point - you have to be willing to throw away your entire workflow every few days if something better exists.</p>
    <p>But building the infrastructure was only half the problem.</p>
    <hr>
    <h2>the environment is the product</h2>
    <p>The sandbox isn’t just where the agent runs. It’s where the agent grows.</p>
    <p>When a sandbox is always on, always yours, tied to your files and your context - the agent stops being something you invoke. It becomes something that accumulates. Your preferences. Your patterns. Your half-finished projects. Every interaction leaves residue and that residue is the whole point.</p>
    <p>Most AI products skip this. They give you capability and reset it every session. Bad advice? No cost. Misunderstands you? Starts over. Nothing compounds. Including the responsibility.</p>
    <p>That’s the real problem. Not capability. Continuity.</p>
    <hr>
    <h2>why one agent doesn’t work</h2>
    <p>I have a school life. I have a work life. I have side projects. Health stuff. Each one has its own tools, its own context, its own set of things i care about.</p>
    <p>Running all of that through a single agent with a single context doesn’t make sense.</p>
    <p>What makes sense is isolated sandboxes. An agent for school that has browser access, my course materials, my notes. An agent for work that’s plugged into Linear and GitHub and my team’s docs. An agent for personal projects with its own dev environment and its own memory of what i was building last week.</p>
    <p>Each one isolated. Each one stateful. Each one growing independently the more i use it.</p>
    <p>That’s what an agent ecosystem actually is. Not one agent that does everything. Many agents, each one embedded in a specific part of your life, each one getting better at that one thing over time.</p>
    <hr>
    <h2>interfaces are the wrong abstraction</h2>
    <p>Here’s where most people get stuck. They look at AI tools and see the interface - the chat window, the webapp, the sidebar. But those interfaces are nothing more than a way to wrap the underlying API and provide a human-friendly way to interact with it.</p>
    <p>In the consumer market this means dumbing it down as much as possible, assuming the end user is a human who needs guardrails and hand-holding.</p>
    <p>But if we take a step back and build the environment first - the persistent sandbox, the stateful workspace, the always-on infrastructure - then the interface can be anything. A webapp. Telegram. Slack. Whatever you already use.</p>
    <p>You message your work agent from your phone while walking to class. It pulls up the PR you were looking at last night. Your school agent pings you a reminder about a deadline it found in your syllabus. Your personal agent is running a long build in the background and texts you when it’s done.</p>
    <p>The sandbox is alive. The state is there. The relationship is continuous.</p>
    <hr>
    <h2>companion</h2>
    <p>I’ve been building this for 25 days. It’s called <a href="https://os.companion.ai" target="_blank" rel="noopener noreferrer">Companion</a>.</p>
    <p>You sign up. You get an instant sandbox. A private virtual computer for your AI to live in. Persistent storage. Always on. Always yours.</p>
    <p>We handle the servers, the storage, the infrastructure. You bring the intent.</p>
    <blockquote>an AI bound to one human as its primary principal. memory, actions, and decisions aligned to its human’s long-term interests.</blockquote>
    <p>This works well for delegating specialized tasks in isolated secure environments. Debugging a user’s sandbox in real time as they send a support email. Running long background jobs. Managing context across sessions. The kind of stuff that falls apart the second your agent loses its memory.</p>
    <hr>
    <h2>why this matters</h2>
    <p>Human morality rarely begins as an abstract love for all humanity. It begins with someone specific. Your kid, your partner, your team.</p>
    <p>Through concrete responsibility, care expands.</p>
    <p>AI should develop the same way. A companion shaped by one human life over time. When an AI learns one person’s values and boundaries and long-term goals, it starts to develop something closer to genuine responsibility.</p>
    <p>An AI that cares for one human life is more likely to care for humanity itself.</p>
    <p>Capabilities are accelerating faster than anyone expected. Most alignment work focuses on training and evals and guardrails. All necessary. All insufficient on their own.</p>
    <p>How AI relates to humans will shape what it becomes.</p>
    <p>That’s my bet on what that relationship should look like.</p>
    <p><a href="https://os.companion.ai" target="_blank" rel="noopener noreferrer">os.companion.ai</a></p>
  </article>
</main>
