<script>
  import Seo from "$lib/Seo.svelte";

  const title = "the agent environment";
</script>

<Seo {title} description="why isolated long running agents need kubernetes" />

<main class="thought">
  <nav><a href="/" class="back-link">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">February 2026</p>
    </header>
    <p>The bottleneck for long running agents is no longer the model.</p>
    <p>It’s the environment.</p>
    <p>Autonomous agents are a simple runtime built on top of <a href="https://github.com/badlogic/pi-mono" target="_blank" rel="noopener noreferrer">runtime primitives</a> and WebSockets for communication via channels people already use everyday. The magic is that the agent gets a “real” workspace.</p>
    <p><a href="https://manus.im" target="_blank" rel="noopener noreferrer">Manus</a>, <a href="https://www.daytona.io" target="_blank" rel="noopener noreferrer">Daytona</a>, <a href="https://e2b.dev" target="_blank" rel="noopener noreferrer">E2B</a> and others made it clear that the future of agents involves a personal computer aesthetic. With this came the burden of execution and maintenance.</p>
    <p>I ran a long running task on a Daytona connection with a simple Python framework and it didn’t take long to crash out. Daytona was built for burst workloads, not for long running agents that need to live in their environment.</p>
    <p>When building companion-os I had to think about spin-up time, vertical auto-scaling, pod isolation, network, disk mounting, gateway exposure, pod-restart persistence, and custom per-sandbox updates.</p>
    <p>Kubernetes turned out to be the right framework. It’s traditionally used for distributing consensus computation across thousands of nodes, but it gives you pod isolation, VPA, autoscaler, and rolling updates out of the box.</p>
    <p>About two days in I stumbled upon kube-sandboxes - a Python SDK that abstracts the controller layer into a CRD with pretty much everything I’d spent 48 hours writing from scratch.</p>
    <p>We needed persistence through restarts. <a href="https://aws.amazon.com/efs/" target="_blank" rel="noopener noreferrer">EFS</a> fits perfectly - mount a folder from a pod to a central AWS filesystem with per-user access points and gigabit-based billing.</p>
    <p>Pairing this with <a href="https://aws.amazon.com/fargate/" target="_blank" rel="noopener noreferrer">AWS Fargate</a> dropped our total cost to  $3 per user per month.</p>
    <p>Each sandbox is an isolated Kubernetes pod with its own network policy, resource limits, and EFS-backed workspace. A warm pool keeps  10 pods pre-provisioned so new users spin up in under 5 seconds. <a href="https://karpenter.sh" target="_blank" rel="noopener noreferrer">Karpenter</a> handles node-level scaling underneath.</p>
    <p>The agent doesn’t know or care about any of this. It just sees a filesystem, a network connection, its running processes, and the user’s message input.</p>
    <p>I built <a href="https://git.harivan.sh/harivansh-afk/agentikube" target="_blank" rel="noopener noreferrer">agentikube</a> to abstract this for others - a Helm chart where you write a simple config and run a couple commands to get everything online. CPU, storage, sandbox settings, all in one place.</p>
    <p>An agent in a throwaway container with no persistent storage is fundamentally limited. It can’t accumulate context. It can’t install tools and keep them around.</p>
    <p>Give it an isolated persistent sandbox and the ceiling goes way up. The agent builds its workspace over time, maintains state across sessions, and operates without stepping on other agents.</p>
    <p>The models will keep getting better. The harness will keep evolving. But the environment is what lets agents go from “run a task” to “live in a workspace.”</p>
  </article>
</main>
