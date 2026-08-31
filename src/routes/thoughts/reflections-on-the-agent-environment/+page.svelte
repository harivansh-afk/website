<script>
  import Seo from "$lib/Seo.svelte";

  const title = "reflections on the agent environment";
</script>

<Seo {title} description="from companion os to agent computer - what i learned building agent infrastructure" />

<main class="thought">
  <nav><a href="/" class="back-link">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">March 2026</p>
    </header>
    <p>I’ve been thinking a lot about the agent environment. it started when my friend Advait approached me about openclaw - or, as it was called at the time, Clawd Bot. he saw a clear need for people to host these systems easily and wanted me to help build something anyone could spin up with a single click.</p>
    <p>that conversation kicked off our exploration of what environment actually means for a stateless function like a large language model. we started shaping the infrastructure that would let agents maintain state, run long tasks, and interact with real systems.</p>
    <p>we launched our first product: <a href="https://os.companion.ai" target="_blank" rel="noopener noreferrer">Companion OS</a>. it got real traction - i was deep in learning Kubernetes at the time. during that build i created three separate projects alongside Companion, learning about file systems, isolation layers, and container orchestration. Companion OS got 150,000 views and about 2,000 users in three hours. we got a lot of data to learn from and understood what the need was.</p>
    <p>next came Einstein - an idea i had while working at my last company. i was a full-time student at UVA in Charlottesville but also working full-time in New York City, grinding 14 to 16 hours a day. schoolwork felt shallow, so i built an AI agent that could use Canvas, Gradescope, and other platforms to handle assignments for me. we turned that into <a href="https://einstein.companion.ai" target="_blank" rel="noopener noreferrer">Einstein</a>.</p>
    <p>we launched it partly to make a point - to show professors and the world that this technology was already here and that coursework needed to catch up. it got <a href="https://www.cnet.com/tech/services-and-software/companion-einstein-ai-tool/" target="_blank" rel="noopener noreferrer">a lot of press</a>. a lot of professors reached out and we learned a ton about how people actually want to use these tools. Einstein was a successful experiment.</p>
    <p>We went back to the drawing board to build a new product. The goal was to give agents a place to run together - shared compute, shared state, without stepping on each other.</p>
    <p>Introducing <a href="https://x.com/advaitpaliwal/status/2036123714157420959" target="_blank" rel="noopener noreferrer">Agent Computer</a> - a hosting platform that lets you spin up sandboxes in under a second, keep them around as long as you need, and let agents accumulate context and capabilities over time. Built on <a href="https://github.com/rivet-dev/sandbox-agent" target="_blank" rel="noopener noreferrer">Rivet’s</a> Sandbox Agent and Firecracker microVMs.</p>
    <p>a parallel shift in my workflow has been moving away from running things locally. <a href="https://git.harivan.sh/harivansh-afk/nix" target="_blank" rel="noopener noreferrer">Nix</a> let me define my entire environment declaratively which was pretty cool. This paired with Agent Computer, i can drop my entire dev setup - tools, skills, secrets - into a remote VM with one click.</p>
    <p>the direction feels clear: portable environments that follow you across machines, entirely in the cloud, nothing running locally.</p>
    <p>as i spend less time in my text editor, this feels like the obvious next step.</p>
  </article>
</main>
