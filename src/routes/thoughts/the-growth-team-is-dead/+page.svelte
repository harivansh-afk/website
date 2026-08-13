<script>
  const title = "the growth team";
  const description = "why one builder plus operators beats a traditional growth team";
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
      <p class="meta">December 2025</p>
    </header>
    <p>it’s almost early 2026 and the way companies scale growth is changing faster than i realized.</p>
    <p>i’ve been thinking about this for about 5 months now. the old growth playbooks weren’t just inefficient - they were structurally wrong about what you need to optimize for today.</p>
    <p>you don’t need a 10-person growth team as a pre-seed to series A startup anymore. you need engineers tightly coupled with growth operators.</p>
    <p>growth teams scaled because building internal tooling was slow. the learning curve for any new system followed a predictable split between learning and implementation. you needed specialists who’d already done the learning so you could skip to iteration. hiring was the only way to move faster.</p>
    <p>ai killed that curve. the time to reach iteration has been cut dramatically. as an engineer embedded within multiple teams, handling nuanced business logic is easier and faster than ever. i’m never waiting to get up to speed anymore and most of my time is spent building and learning in parallel.</p>
    <p>most growth teams still operate on a non-technical stack: google sheets for tracking, hubspot for CRM, zapier for automation. every tool is generalized for mass usage. hubspot wasn’t built for your specific outreach flow. zapier doesn’t know your business logic. so you hire more people to bridge gaps. skills grow linearly with no compounding.</p>
    <p>consider a different structure: one technical person embedded directly with growth operators, building internal systems that fit exactly what they need.</p>
    <p>the engineer isn’t building to a spec handed down through a product manager. they’re in the room when problems surface and can ship instantaneously. the operator isn’t waiting on a roadmap - they complain and get exactly what they need, when they need it.</p>
    <p>every system the builder creates makes the operator more effective. every insight the operator surfaces makes the next system better. the loop compounds.</p>
    <p>at phia, i was building the b2b systems while still learning how our strategic partnerships worked. the affiliate team spent 100% of their time strategizing and pointing out problems, enabling insane shipping speeds. by the time strategy was decided, the system was already being used.</p>
    <p>a ugc program scaled to 40 creators managed by two university interns. they were exceptional operators because the tooling was built for their specific workflow, which they iterated on the fly.</p>
    <p>this model works best when the infrastructure is centralized. mono-repo infra lets agentic coding speeds scale exponentially as you get better at context engineering in a confined environment. a system that took 2 days to ship takes a couple hours on iteration two.</p>
    <p>build observability first. nothing else matters until you can see what’s happening. the instinct is to automate workflows first, but without observability you’re optimizing blind.</p>
    <p>this model needs someone comfortable with real infrastructure. aws, gcp, the boring stuff. a vercel bot won’t cut it. ai amplifies what’s already there - you can’t outsource thinking, only accelerate it.</p>
    <p>it also requires real comfort between the engineer and whoever they’re building for. being friends with your counterpart is a multiplier you can’t replicate. no friction means instant feedback, no politics, no ego.</p>
    <p>if you’re friends with the people you work with, you will win faster than anyone else.</p>
  </article>
</main>
