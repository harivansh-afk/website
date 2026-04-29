#import "../_layout.typ": *

#thought(
  title: "the agent environment",
  description: "why isolated long running agents need kubernetes",
  date: "February 2026",
)[
  #elem("p")[The bottleneck for long running agents is no longer the model.]
  #elem("p")[It's the environment.]
  #elem("p")[Autonomous agents are a simple runtime built on top of #link("https://github.com/badlogic/pi-mono", [runtime primitives]) and WebSockets for communication via channels people already use everyday. The magic is that the agent gets a "real" workspace.]
  #elem("p")[#link("https://manus.im", [Manus]), #link("https://www.daytona.io", [Daytona]), #link("https://e2b.dev", [E2B]) and others made it clear that the future of agents involves a personal computer aesthetic. With this came the burden of execution and maintenance.]
  #elem("p")[I ran a long running task on a Daytona connection with a simple Python framework and it didn't take long to crash out. Daytona was built for burst workloads, not for long running agents that need to live in their environment.]
  #elem("p")[When building companion-os I had to think about spin-up time, vertical auto-scaling, pod isolation, network, disk mounting, gateway exposure, pod-restart persistence, and custom per-sandbox updates.]
  #elem("p")[Kubernetes turned out to be the right framework. It's traditionally used for distributing consensus computation across thousands of nodes, but it gives you pod isolation, VPA, autoscaler, and rolling updates out of the box.]
  #elem("p")[About two days in I stumbled upon kube-sandboxes - a Python SDK that abstracts the controller layer into a CRD with pretty much everything I'd spent 48 hours writing from scratch.]
  #elem("p")[We needed persistence through restarts. #link("https://aws.amazon.com/efs/", [EFS]) fits perfectly - mount a folder from a pod to a central AWS filesystem with per-user access points and gigabit-based billing.]
  #elem("p")[Pairing this with #link("https://aws.amazon.com/fargate/", [AWS Fargate]) dropped our total cost to ~\$3 per user per month.]
  #elem("p")[Each sandbox is an isolated Kubernetes pod with its own network policy, resource limits, and EFS-backed workspace. A warm pool keeps ~10 pods pre-provisioned so new users spin up in under 5 seconds. #link("https://karpenter.sh", [Karpenter]) handles node-level scaling underneath.]
  #elem("p")[The agent doesn't know or care about any of this. It just sees a filesystem, a network connection, its running processes, and the user's message input.]
  #elem("p")[I built #link("https://github.com/harivansh-afk/agentikube", [agentikube]) to abstract this for others - a Helm chart where you write a simple config and run a couple commands to get everything online. CPU, storage, sandbox settings, all in one place.]
  #elem("p")[An agent in a throwaway container with no persistent storage is fundamentally limited. It can't accumulate context. It can't install tools and keep them around.]
  #elem("p")[Give it an isolated persistent sandbox and the ceiling goes way up. The agent builds its workspace over time, maintains state across sessions, and operates without stepping on other agents.]
  #elem("p")[The models will keep getting better. The harness will keep evolving. But the environment is what lets agents go from "run a task" to "live in a workspace."]
]
