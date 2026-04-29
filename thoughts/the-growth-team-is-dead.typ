#import "../_layout.typ": *

#thought(
  title: "the growth team",
  description: "it's early 2025 and the way companies scale growth is changing faster than most people realize.",
  date: "December 2025",
)[
  #elem("p")[it's almost early 2026 and the way companies scale growth is changing faster than i realized]
  #elem("p")[i've been thinking about this for about 5 months now, the old growth playbooks weren't just inefficient they were structurally wrong about the things you need to optimize for today.]
  #elem("p")[the tldr: you don't need a 10-person growth team as a preseed -> series A startup anymore.]
  #elem("p")[you need engineers tightly coupled with growth operators]

  #elem("hr")
  #elem("h2")[why growth teams got big]

  #elem("p")[growth teams scaled because building internal tooling was slow. the learning curve for any new system followed a predictable split:]
  #elem("blockquote")[StackedBarChart visual omitted in this Typst port.]
  #elem("p")[this ratio held up for decades. you needed specialists who had already done the learning, so you could skip straight to implementation + iteration phases. you needed manpower to scale systems as they were slowly built out.]
  #elem("p")[hiring was the only way to move faster.]

  #elem("hr")
  #elem("h2")[ai killed the learning curve]

  #elem("p")[with ai, both sides of this equation are scaling exponentially. the time to reach the iteration phase has been cut by almost 70%:]
  #elem("blockquote")[DualLineChart visual omitted in this Typst port.]
  #elem("p")[as an engineer embedded deeply within multiple teams, handling nuanced business logic is easier and faster than ever. I'm never waiting to "get up to speed" anymore and most of my time is spent building and learning in parallel. the iteration phase is where i spend most of my time which is the gold standard for accelerated learning.]
  #elem("p")[low-level systems that took weeks and many 'syncs' to build now take hours and some texting back and forth to get up and running.]
  #elem("p")[this changes what's possible with small teams:]
  #elem("blockquote")[DataTable visual omitted in this Typst port.]

  #elem("hr")
  #elem("h2")[the stack that doesn't scale]

  #elem("p")[most growth teams still operate on a non-technical stack: google sheets for tracking, hubspot or airtable for crm, zapier for "automation," and maybe some inbox management tools.]
  #elem("p")[the problem? every tool is generalized for mass usage:]
  #elem("blockquote")[LineChart visual omitted in this Typst port.]
  #elem("p")[hubspot wasn't built for your specific outreach flow. zapier doesn't know your business logic. google sheets doesn't understand your data model.]
  #elem("p")[so you hire more people to bridge gaps. skills grow linearly with no compounding.]

  #elem("hr")
  #elem("h2")[one builder + operators]

  #elem("p")[consider a different structure: one technical person embedded directly with growth operators, building internal systems that fit exactly what they need.]
  #elem("blockquote")[EntityDiagram visual omitted in this Typst port.]
  #elem("blockquote")[ComparisonChart visual omitted in this Typst port.]
  #elem("p")[X and Y are tightly coupled. the engineer isn't building to a spec handed down through a product manager. they're in the room when problems surface and have the ability to ship instantaneously. the growth operator isn't waiting on a roadmap, they're allowed to complain and get exactly what they need, when they need it.]
  #elem("p")[every system X builds makes Y more effective. every insight Y surfaces makes X's next system better. the loop sparks q-factor growth.]

  #elem("hr")
  #elem("h2")[what the builder learns]

  #elem("blockquote")[StackedBarChart visual omitted in this Typst port.]

  #elem("ul")[
    #item([\*\*domain understanding (25%)\*\* — you learn faster when you're in the room])
    #item([\*\*technical implementation (35%)\*\* — ai handles the boilerplate])
    #item([\*\*system iteration (25%)\*\* — tight feedback means faster cycles])
    #item([\*\*infrastructure knowledge (15%)\*\* — compounds as the mono repo grows])
  ]

  #elem("p")[at phia, i was building the b2b systems while still learning how our strategic partnerships worked.]
  #elem("p")[the affiliate team was able to spend 100% of their time strategizing and pointing out problems, enabling insane shipping speeds.]
  #elem("p")[by the time the strat was decided, the system was already being used allowing the team to iterate on a more abstracted level of thought.]

  #elem("hr")
  #elem("h2")[what the operator learns]

  #elem("blockquote")[StackedBarChart visual omitted in this Typst port.]

  #elem("ul")[
    #item([\*\*tool proficiency (30%)\*\* — one internal system beats juggling five external ones])
    #item([\*\*domain execution (40%)\*\* — less manual work means more time for actual strategy])
    #item([\*\*feedback articulation (20%)\*\* — they learn what problems are solvable])
    #item([\*\*strategic thinking (10%)\*\* — compounds as busywork disappears])
  ]

  #elem("p")[a ugc program was able to scale to 40 creators managed by two university interns. they were exceptional operators because they knew exactly what they wanted and got it 100% of the time. their learning curve was compressed because the tooling was built for their specific workflow which they were able to iterate on the fly]

  #elem("hr")
  #elem("h2")[why one codebase wins]

  #elem("p")[this model works well if the infrastructure is centralized.]
  #elem("p")[mono-repo infra allows agentic coding speeds to scale exponentially as you get better at context engineering in a confined environment.]
  #elem("blockquote")[ArchitectureDiagram visual omitted in this Typst port.]
  #elem("p")[when everything lives in one place, you reuse libraries and api patterns. a system that maybe took 2 days to ship would take a couple hours on iteration \#2 due to centralized and clean context/preferences.]

  #elem("hr")
  #elem("h2")[observability]

  #elem("blockquote")[FlowDiagram visual omitted in this Typst port.]
  #elem("p")[every morning the entire team receives curated updates on micro movements.]
  #elem("p")[revenue, user growth, performance, all of it.]
  #elem("p")[the team watches shifts in real time and reacts instantly. accountability is a prerequisite for hyper-growth]

  #elem("hr")
  #elem("h2")[what to build first]

  #elem("p")[observability. nothing else matters until you can see what's happening.]
  #elem("p")[the instinct is to automate workflows first. feels like progress. but without observability you're optimizing blind.]
  #elem("p")[build the centralized data layer for company wide core metrics. once you can see, you know what to automate]

  #elem("hr")
  #elem("h2")[the talent this requires]

  #elem("p")[this model needs someone comfortable with real infrastructure. aws, gcp, the boring stuff. a vercel/next.js bot won't cut it.]
  #elem("p")[without that foundation you get systems that work in demo but break under load. ai amplifies what's already there. you can't outsource thinking, only accelerate it]

  #elem("hr")

  #elem("p")[this also requires real comfort between the engineer and whoever they're building for.]
  #elem("p")[being friends with your counterpart is a multiplier you can't replicate. no friction means instant feedback, no politics, no ego. you'll spend more time strategizing than coding.]
  #elem("p")[that has to feel easy.]
  #elem("blockquote")[if you're friends with the people you work with, you will win faster than anyone else]
]
