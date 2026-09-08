<script>
  import Seo from "$lib/Seo.svelte";

  const title = "the autonomy radius";
</script>

<Seo {title} description="Feedback throughout the software development lifecycle: compiler checks, runtime harnesses, simulation, observability, and agents in forked VMs." />

<main class="thought autonomy">
  <nav>
<a href="/thoughts/" class="back-link">..</a>
</nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">September 2026</p>
    </header>
<p>
<em>Adapted from my talk at the YC AI unconference, August 2026.</em>
</p>
<p>At Indexable, we build VM infrastructure. Our own hypervisor, our own file system, our own replicated storage fabric. Live migration, snapshots, recovery, the things underneath the API that have to keep working while customers are using them.</p>
<p>Agents work throughout that codebase.</p>
<p>Which makes the interesting question pretty concrete: how much of the development lifecycle can they actually carry on their own?</p>
<p>Writing the implementation is one part. There is also deciding whether the abstraction belongs, whether a change preserves a protocol, whether the benchmark is meaningful, whether the system survives a crash, and what happened when production stopped behaving the way the code says it should.</p>
<p>If all of those questions come back to a person, generating more code just gives that person more work.</p>
<p>So we have spent a lot of time building the systems around the agents. Linters that encode how we want code to look. Compiler checks for things a syntax tree cannot tell us. Runtime harnesses for the protocols we are building. Simulation that searches for failures we did not think to write a test for. Production tooling that lets an agent investigate the same system we see.</p>
<p>Each of those changes what work can proceed without us in the middle.</p>
<p>I call that the autonomy radius.</p>
<h2>the circle is made of feedback</h2>
<p>Put an agent in the middle of a circle. Inside it is the work for which it can make a change, observe the result, and meaningfully decide what to do next.</p>
<p>The compiler is already in there. So are types and the tests the agent can run. It writes something, gets a useful failure, changes it, tries again.</p>
<p>Further out are questions like whether a storage migration preserves data, whether a refactor makes the codebase worse, or why a request spent most of its time apparently doing nothing.</p>
<p>The model can reason about those questions. But reasoning needs something to push against. If the only answer available is another reading of the same source, the loop is missing the observation that could show the reasoning was wrong.</p>
<p>That is where the surrounding system matters.</p>
<p>Feedback needs to be fast enough to use while working, and it needs to check the thing you actually care about. A quick answer to the wrong question is still the wrong answer. A useful answer that arrives after every decision has already been made belongs to a different loop.</p>
<p>That gives the lifecycle several overlapping loops, at different speeds:</p>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus allows horizontal scrolling of the table.) -->
<div class="table-scroll" tabindex="0" role="region" aria-label="Development lifecycle feedback">
<table>
<thead>
<tr>
<th>Where</th>
<th>What supplies feedback</th>
<th>What it lets us decide</th>
</tr>
</thead>
<tbody>
<tr>
<td>While writing</td>
<td>Syntax rules, compiler lints, clone detection</td>
<td>Does this change fit the codebase's constraints?</td>
</tr>
<tr>
<td>While developing</td>
<td>Models, probes, runtime harnesses, benchmarks</td>
<td>Does the implementation satisfy the particular contract we are working on?</td>
</tr>
<tr>
<td>While merging</td>
<td>The gate stack for the affected paths</td>
<td>Has this candidate met the requirements for landing?</td>
</tr>
<tr>
<td>After merge</td>
<td>Scheduled deterministic simulation</td>
<td>What failures can we find by exploring more executions?</td>
</tr>
<tr>
<td>In production</td>
<td>Shared telemetry and the fleet IDE</td>
<td>What is the deployed system actually doing?</td>
</tr>
</tbody>
</table>
</div>
<p>The radius is a picture of that coverage. It is not a score for model intelligence, and it does not mean a class of failures has been eliminated forever.</p>
<p>A better model helps with the work inside these loops. It can also help build the missing ones. But upgrading the model does not, by itself, make an unobserved property observable.</p>
<h2>while writing: make the opinions executable</h2>
<p>Start with something small:</p>
<pre>
<code class="language-rust">let port = u16::try_from(cfg.port).unwrap_or_default();
</code>
</pre>
<p>The conversion can fail. The fallback turns that failure into zero.</p>
<p>Now the rest of the program receives a valid integer with the wrong meaning. An invalid configuration has become an apparently successful conversion. The useful point to stop was right here, while the error still explained what went wrong.</p>
<p>We want that error propagated. We also want the next agent to reach the same conclusion without another review comment.</p>
<p>This is how a lot of our tooling starts: a concrete behavior we keep seeing, a decision about what the code should do instead, and a check that makes the decision repeatable.</p>
<p>Some of these decisions are about semantics. Others are about keeping the codebase legible. Returning three values of the same type in an anonymous tuple makes their meanings positional. Naming the fields gives callers something better than remembering which <code>usize</code> is which. Copying a retry loop and changing the constants creates another implementation that can drift.</p>
<p>The code can pass its behavioral tests and still fail those constraints.</p>
<p>For syntax-level rules, we built astlog. It runs Datalog over facts extracted from syntax trees, so rules can express relationships between nodes. An <code>unwrap</code> inside a function returning <code>Result</code> is a useful teaching example: find the call, find the containing function, relate it to the return declaration.</p>
<p>Every shipped lint needs examples of code it should reject and code it should accept. The fixture harness checks both directions. A rule that never fires can look perfectly healthy if all you test is good code.</p>
<p>Clone detection covers another part of this. It fingerprints syntax so renaming variables or changing literals does not make a copied structure disappear. New duplication is charged against the change. Existing debt has a budget and a recorded history; raising that budget needs written justification. Changing the acceptance criterion is a separate decision from fixing the code.</p>
<p>This is the development loop acquiring an opinion about the codebase it is producing.</p>
<h2>when syntax runs out</h2>
<p>There is a limit to what astlog can know. It sees syntax. It does not resolve types across the program.</p>
<p>Consider:</p>
<pre>
<code class="language-rust">drop(tx.send(result));
</code>
</pre>
<p>The value was consumed, so the usual unused-result check is satisfied. But if the send failed, we just discarded the evidence.</p>
<p>You cannot fix this by banning <code>drop</code>. Dropping a guard can be exactly how you release a resource. The question is whether the value being dropped has a must-use contract, and that information may live on a definition in another package.</p>
<p>So we carry a Clippy fork with checks that use the compiler's understanding of the program.</p>
<p>The same distinction matters for tracing. Suppose a function already instruments its asynchronous work, but one awaited operation has no span. That operation can become an unexplained gap in the trace. Later, someone investigating latency has to reconstruct what the program could have told them directly.</p>
<p>Our <code>uninstrumented_await</code> lint checks functions that already contain spans. It holds the code to an observability decision it has already made.</p>
<p>The check needs types because instrumentation can happen before the await:</p>
<pre>
<code class="language-rust">let future = receive_body().instrument(span);
future.await?;
</code>
</pre>
<p>A rule looking for an instrumentation call beside <code>.await</code> would get this wrong. The compiler can inspect the future's type through the binding. The lint still has limits; for example, instrumentation inside a callee is not necessarily visible at this point, so explicit, reasoned exceptions are part of the policy.</p>
<p>This is already a connection across the lifecycle. A build failure during development improves the evidence available during a production incident. Observability starts in the code that creates the event, long before anyone opens a dashboard.</p>
<h2>the backlog can work itself</h2>
<p>Once bad patterns are detectable, they can also become inputs to scheduled work.</p>
<p>Our idiomatic workflow looks for cleanup opportunities, has an agent make the change, and runs the applicable validation.</p>
<p>One example from the talk was a repeated virtio queue-drain loop in three device implementations. The shared mechanics were the same; what each device did with a descriptor chain differed.</p>
<p>Detection gave the agent a place to look. The agent still had to choose the abstraction: shared queue handling, with the device-specific behavior passed through a closure. Then the tests and structural checks evaluated the candidate. The recorded PR validation included 134 passing device tests.</p>
<p>That separation matters. A duplicate detector does not design a good helper. An agent's proposed helper does not validate itself. The workflow uses each where it is useful.</p>
<figure>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus allows horizontal scrolling of the diagram.) -->
<div class="diagram-scroll" tabindex="0" role="region" aria-label="Scrollable diagram">
<svg viewBox="0 0 720 430" role="img" aria-labelledby="autonomy-title-1">
<title id="autonomy-title-1">Cleanup workflow: an agent retries failed checks and lands a passing change.</title>
<defs>
<marker id="autonomy-arrow-1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M 0 0 L 10 5 L 0 10 z" class="arrowhead" />
</marker>
</defs>
<rect x="175" y="20" width="370" height="60" />
<text x="360.0" y="45" text-anchor="middle">Detect a recurring pattern</text>
<rect x="175" y="130" width="370" height="60" />
<text x="360.0" y="155" text-anchor="middle">Agent investigates</text>
<text x="360.0" y="174" text-anchor="middle">and proposes a change</text>
<rect x="175" y="240" width="370" height="60" />
<text x="360.0" y="265" text-anchor="middle">Run applicable checks</text>
<rect x="175" y="350" width="370" height="60" />
<text x="360.0" y="375" text-anchor="middle">Land through merge workflow</text>
<path d="M 360 80 V 130" fill="none" marker-end="url(#autonomy-arrow-1)" />
<path d="M 360 190 V 240" fill="none" marker-end="url(#autonomy-arrow-1)" />
<path d="M 360 300 V 350" fill="none" marker-end="url(#autonomy-arrow-1)" />
<path d="M 545 270 H 655 V 160 H 545" fill="none" marker-end="url(#autonomy-arrow-1)" stroke-dasharray="5 5" />
<text x="650" y="212" text-anchor="end">failure</text>
<text x="650" y="231" text-anchor="end">+ evidence</text>
<text x="382" y="331" text-anchor="start">pass</text>
</svg>
</div>
<figcaption>Figure 1. The agent supplies the implementation judgment inside a workflow whose checks remain explicit.</figcaption>
</figure>
<p>Symphony runs these workflows and can carry the change through merge. Different paths have different gate stacks. The checks appropriate for documentation are not sufficient evidence for a storage change.</p>
<p>There is still a decision about what those gates establish. A passing test suite supports a particular set of claims about a particular candidate. It does not become a universal proof because a bot is the one pressing merge.</p>
<p>The useful change is that routine work can complete against an existing contract. We do not have to rediscover the contract in every PR.</p>
<h2>while developing: a harness per problem</h2>
<p>The harder questions are specific to the system.</p>
<p>What can garbage collection reclaim while references are changing? When has a node actually stopped accepting work? Which acknowledged writes must survive reopening a journal?</p>
<p>A compiler cannot answer those. The meaning lives in the protocol we designed.</p>
<p>So the protocol gets a harness.</p>
<p>For the quiesce protocol, we model behavior as a pure state machine and also exercise it through a live oracle against real containers under kills. The model lets us generate and explore transitions without paying for the whole environment. The live test checks behavior across boundaries the model abstracts away.</p>
<p>Those are different sources of evidence. Agreement is useful precisely because they do not exercise the implementation in the same way.</p>
<p>For garbage-collection drain behavior, we also have a simulator that runs under ordinary <code>cargo test</code> with a paused Tokio clock. That makes particular schedules repeatable without waiting for time to pass in the real world.</p>
<p>Our application-level crash simulator, det-sim, models things like torn writes and sticky <code>fsync</code> failures. The talk includes a missing <code>fsync</code> in certificate storage that it exposed. A successful write had not established the durability the recovery path needed.</p>
<p>These instruments belong in the development environment. An agent working on the protocol should be able to run one, inspect the failure, change the implementation, and run it again.</p>
<p>A benchmark needs the same treatment. Our drain benchmark separates collecting measurements from comparing a candidate against the design document's ship rule. The comparison returns a process status. A regression, an inadmissible comparison, and a broken benchmark invocation are different outcomes.</p>
<p>If those all collapse into a blob of terminal output that a person must interpret, part of the development loop still lives in that person's head.</p>
<p>At the time of the talk, our inventory counted 25 runtime harnesses and roughly 53,000 lines of Rust devoted to them. That was a measurement of the verification system we had built, not a target for how large one should be.</p>
<p>Writing another small program whose job is to answer one hard question has become a normal part of implementing the feature.</p>
<h2>production introduces schedules you did not write down</h2>
<p>A fleet combines hosts, kernels, disks, networks, tenants, and deployments. The interesting failures often sit between operations that are individually reasonable.</p>
<p>A node dies during recovery. A deployment changes one side of a protocol while the other side is draining. A journal reopens after a crash at the point its in-memory state and durable state disagree.</p>
<p>You can test known sequences directly. You also need a way to search sequences you have not anticipated.</p>
<p>This is where deterministic simulation testing fits. We run the system under a deterministic hypervisor, inject faults, drive workloads, and assert properties about the resulting executions. When an assertion fails, the execution can be replayed to the failure.</p>
<p>There are two pieces of engineering here: arranging for the hazards to happen, and deciding what must remain true when they do.</p>
<p>Killing a process is easy. Defining which data it was allowed to lose requires understanding the durability contract. Data that was never durably acknowledged and data the system promised to retain cannot be treated as the same case.</p>
<p>The same applies to liveness. A deadline needs a meaningful clock and assumptions about when progress is possible. Otherwise a test can mistake its own stalled harness for a failure of the system under test.</p>
<p>That is why building the workload and assertions is substantial work. The simulator supplies the exploration machinery. We supply the system's meaning.</p>
<h2>the journal that forgot its history</h2>
<p>One case in the talk is easiest to explain as a write-ahead journal. This is a representative picture of our block-volume journal, with internal details removed.</p>
<p>Each write receives a sequence number. Within the journal's history, those numbers identify records that recovery must distinguish. Once records through sequence 4 are durable, reopening that history must not hand out sequence 0 as a new record.</p>
<p>The workload repeatedly killed the writer and reopened the journal. A recorded run produced exactly that counterexample: an acknowledged sequence 0 with the journal already flushed through 4. The report placed it at about 34.7 seconds of virtual time.</p>
<figure>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus allows horizontal scrolling of the diagram.) -->
<div class="diagram-scroll" tabindex="0" role="region" aria-label="Scrollable diagram">
<svg viewBox="0 0 720 485" role="img" aria-labelledby="autonomy-title-2">
<title id="autonomy-title-2">Journal counterexample: after flushing through sequence 4 and reopening, the writer receives sequence 0.</title>
<defs>
<marker id="autonomy-arrow-2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M 0 0 L 10 5 L 0 10 z" class="arrowhead" />
</marker>
</defs>
<rect x="25" y="15" width="170" height="60" />
<text x="110.0" y="40" text-anchor="middle">Writer</text>
<path d="M 110 75 V 460" stroke-dasharray="4 6" />
<rect x="285" y="15" width="170" height="60" />
<text x="370.0" y="40" text-anchor="middle">Journal</text>
<path d="M 370 75 V 460" stroke-dasharray="4 6" />
<rect x="525" y="15" width="170" height="60" />
<text x="610.0" y="40" text-anchor="middle">Property audit</text>
<path d="M 610 75 V 460" stroke-dasharray="4 6" />
<path d="M 110 115 H 370" fill="none" marker-end="url(#autonomy-arrow-2)" />
<text x="240.0" y="103" text-anchor="middle">Append; flush through seq 4</text>
<path d="M 110 235 H 370" fill="none" marker-end="url(#autonomy-arrow-2)" />
<text x="240.0" y="223" text-anchor="middle">Append another record</text>
<path d="M 370 300 H 110" fill="none" marker-end="url(#autonomy-arrow-2)" />
<text x="240.0" y="288" text-anchor="middle">Acknowledge seq 0</text>
<path d="M 110 365 H 610" fill="none" marker-end="url(#autonomy-arrow-2)" />
<text x="360.0" y="353" text-anchor="middle">Report ack and durable boundary</text>
<rect x="45" y="145" width="390" height="45" />
<text x="240" y="173" text-anchor="middle">Kill writer and reopen journal</text>
<path d="M 610 430 H 110" fill="none" marker-end="url(#autonomy-arrow-2)" stroke-dasharray="5 5" />
<text x="360" y="416" text-anchor="middle">Failure: sequence reused below durable boundary</text>
</svg>
</div>
<figcaption>Figure 2. A representative journal, using the failure recorded in the talk's storage simulation run. The diagram describes the violated property, not a confirmed root cause.</figcaption>
</figure>
<p>A function returning success would not expose this. The checker needs to remember history across the crash and compare the acknowledgment with the durable boundary.</p>
<p>Another run falsified a property about recovering a still-referenced chunk after node loss. The talk used a simplified replicated-storage topology to explain the shape of the failure. That illustration was not a literal map of our fabric.</p>
<p>In both cases the useful artifact is a reproducible counterexample. It gives the investigation a particular execution to explain. It does not, on its own, tell you whether the mistake is in the implementation, the workload, or the assertion. Replay is how you work through that distinction.</p>
<p>You also have to read passing results carefully. An assertion that was never evaluated has not passed. A fault workload that never reached its fault can produce a very reassuring report about very little.</p>
<p>So we track whether the interesting conditions were reached, as well as whether the invariants held. Testing the test is part of the same job.</p>
<h2>different loops have different clocks</h2>
<p>The scheduled simulation runs described in the talk ran daily, within a written compute budget. A daily health gate read the latest results for the gated suites. Those runs did not gate the merge queue.</p>
<p>That distinction is deliberate in the article because it changes what a green result means.</p>
<p>During development, a focused model or harness can answer a narrow question about the change being made. The merge workflow evaluates its configured requirements for the candidate. Scheduled simulation spends more time searching executions and feeds discoveries back into engineering work.</p>
<p>You want all of those, without pretending they are the same check.</p>
<figure>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus allows horizontal scrolling of the diagram.) -->
<div class="diagram-scroll" tabindex="0" role="region" aria-label="Scrollable diagram">
<svg viewBox="0 0 720 605" role="img" aria-labelledby="autonomy-title-3">
<title id="autonomy-title-3">Lifecycle feedback: local checks, merge gates, daily simulation and live observation feed changes back into development.</title>
<defs>
<marker id="autonomy-arrow-3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M 0 0 L 10 5 L 0 10 z" class="arrowhead" />
</marker>
</defs>
<rect x="195" y="20" width="330" height="60" />
<text x="360.0" y="45" text-anchor="middle">Implement a change</text>
<rect x="195" y="130" width="330" height="60" />
<text x="360.0" y="155" text-anchor="middle">Focused harnesses</text>
<text x="360.0" y="174" text-anchor="middle">and local checks</text>
<rect x="195" y="240" width="330" height="60" />
<text x="360.0" y="265" text-anchor="middle">Candidate merge gates</text>
<rect x="195" y="350" width="330" height="60" />
<text x="360.0" y="375" text-anchor="middle">Merged system</text>
<path d="M 360 80 V 130" fill="none" marker-end="url(#autonomy-arrow-3)" />
<path d="M 360 190 V 240" fill="none" marker-end="url(#autonomy-arrow-3)" />
<path d="M 360 300 V 350" fill="none" marker-end="url(#autonomy-arrow-3)" />
<rect x="45" y="475" width="285" height="60" />
<text x="187.5" y="500" text-anchor="middle">Daily simulation</text>
<text x="187.5" y="519" text-anchor="middle">and health review</text>
<rect x="390" y="475" width="285" height="60" />
<text x="532.5" y="500" text-anchor="middle">Deployment</text>
<text x="532.5" y="519" text-anchor="middle">and live observation</text>
<path d="M 290 410 V 443 H 187 V 475" fill="none" marker-end="url(#autonomy-arrow-3)" />
<path d="M 430 410 V 443 H 532 V 475" fill="none" marker-end="url(#autonomy-arrow-3)" />
<path d="M 195 160 H 145 V 50 H 195" fill="none" marker-end="url(#autonomy-arrow-3)" stroke-dasharray="5 5" />
<text x="135" y="107" text-anchor="end">retry</text>
<path d="M 45 505 H 20 V 50 H 195" fill="none" marker-end="url(#autonomy-arrow-3)" stroke-dasharray="5 5" />
<path d="M 675 505 H 700 V 50 H 525" fill="none" marker-end="url(#autonomy-arrow-3)" stroke-dasharray="5 5" />
<text x="360" y="581" text-anchor="middle">Findings feed back into implementation</text>
</svg>
</div>
<figcaption>Figure 3. Candidate checks, scheduled exploration, and production observation feed the lifecycle at different points. Passing one does not stand in for the others.</figcaption>
</figure>
<p>A production finding may suggest a new assertion. A simulation counterexample may become a focused regression test. A recurring implementation mistake may become a compiler lint.</p>
<p>That is how the feedback improves over time: an expensive discovery becomes an earlier, more repeatable answer where possible.</p>
<h2>in production: make the system inspectable</h2>
<p>The live system still has to be understandable.</p>
<p>When a VM operation stalls, the explanation may cross the control plane, a host, the hypervisor, the file system, and storage. An agent with access to source code can describe all of those components and still have no idea which one is holding up this operation.</p>
<p>The missing input is what happened in this execution.</p>
<p>Our fleet IDE puts hosts, VMs, journal output, CI runs, and agents into one place. Underneath, agents query the same store of operational data that supports the interface.</p>
<p>The interface helps a person navigate. The query surface lets an agent investigate without a person translating screenshots into prompts. Both need identities that connect an observation to the machine, operation, or run it came from.</p>
<p>This also explains why the tracing lint belongs near the beginning of the story. A production tool cannot reconstruct a distinction the program never recorded. The instrumentation policy and the investigation surface are two ends of the same feedback path.</p>
<p>More telemetry alone does not make diagnosis automatic. The useful thing is being able to follow a symptom into evidence, form a hypothesis, and test it against the running system.</p>
<p>That brings another part of the lifecycle inside the agent's working environment.</p>
<h2>the star pattern</h2>
<p>Once these loops exist, the way you organize the agents changes too.</p>
<p>The pattern we use has a top-level agent coordinating the work and subagents implementing pieces of it. Every agent gets its own VM. The subagent VMs are disk snapshot-forks of the parent's VM: versioned, stateful environments in which they can work and run the relevant harnesses.</p>
<p>The subagent can iterate locally. Its failed attempts, compiler output, and debugging trail do not all have to flow through the coordinating agent's context.</p>
<p>What comes back should be the change and the evidence for it: what was checked, against which state, what passed, and what remains unresolved.</p>
<figure>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus allows horizontal scrolling of the diagram.) -->
<div class="diagram-scroll" tabindex="0" role="region" aria-label="Scrollable diagram">
<svg viewBox="0 0 720 515" role="img" aria-labelledby="autonomy-title-4">
<title id="autonomy-title-4">Star pattern: a coordinating agent forks three worker VMs; each runs checks before returning work for integration.</title>
<defs>
<marker id="autonomy-arrow-4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M 0 0 L 10 5 L 0 10 z" class="arrowhead" />
</marker>
</defs>
<rect x="200" y="20" width="320" height="60" />
<text x="360.0" y="45" text-anchor="middle">Coordinating agent</text>
<text x="360.0" y="64" text-anchor="middle">parent VM</text>
<rect x="15" y="165" width="210" height="60" />
<text x="120.0" y="190" text-anchor="middle">Subagent in VM 1</text>
<rect x="15" y="280" width="210" height="60" />
<text x="120.0" y="305" text-anchor="middle">Relevant checks</text>
<text x="120.0" y="324" text-anchor="middle">and harnesses</text>
<path d="M 360 80 V 120 H 120 V 165" fill="none" marker-end="url(#autonomy-arrow-4)" stroke-dasharray="5 5" />
<path d="M 120 225 V 280" fill="none" marker-end="url(#autonomy-arrow-4)" />
<path d="M 225 310 H 237 V 195 H 225" fill="none" marker-end="url(#autonomy-arrow-4)" stroke-dasharray="5 5" />
<path d="M 120 340 V 385 H 360 V 430" fill="none" marker-end="url(#autonomy-arrow-4)" />
<rect x="255" y="165" width="210" height="60" />
<text x="360.0" y="190" text-anchor="middle">Subagent in VM 2</text>
<rect x="255" y="280" width="210" height="60" />
<text x="360.0" y="305" text-anchor="middle">Relevant checks</text>
<text x="360.0" y="324" text-anchor="middle">and harnesses</text>
<path d="M 360 80 V 120 H 360 V 165" fill="none" marker-end="url(#autonomy-arrow-4)" stroke-dasharray="5 5" />
<path d="M 360 225 V 280" fill="none" marker-end="url(#autonomy-arrow-4)" />
<path d="M 465 310 H 477 V 195 H 465" fill="none" marker-end="url(#autonomy-arrow-4)" stroke-dasharray="5 5" />
<path d="M 360 340 V 385 H 360 V 430" fill="none" marker-end="url(#autonomy-arrow-4)" />
<rect x="495" y="165" width="210" height="60" />
<text x="600.0" y="190" text-anchor="middle">Subagent in VM 3</text>
<rect x="495" y="280" width="210" height="60" />
<text x="600.0" y="305" text-anchor="middle">Relevant checks</text>
<text x="600.0" y="324" text-anchor="middle">and harnesses</text>
<path d="M 360 80 V 120 H 600 V 165" fill="none" marker-end="url(#autonomy-arrow-4)" stroke-dasharray="5 5" />
<path d="M 600 225 V 280" fill="none" marker-end="url(#autonomy-arrow-4)" />
<path d="M 705 310 H 717 V 195 H 705" fill="none" marker-end="url(#autonomy-arrow-4)" stroke-dasharray="5 5" />
<path d="M 600 340 V 385 H 360 V 430" fill="none" marker-end="url(#autonomy-arrow-4)" />
<text x="360" y="147" text-anchor="middle">Snapshot-fork and assign work</text>
<text x="360" y="412" text-anchor="middle">Validated changes and evidence</text>
<rect x="200" y="430" width="320" height="60" />
<text x="360.0" y="455" text-anchor="middle">Parent integrates</text>
<text x="360.0" y="474" text-anchor="middle">and validates combined candidate</text>
</svg>
</div>
<figcaption>Figure 4. Each worker owns an execution environment and a feedback loop. The parent coordinates results; the combined candidate still needs validation.</figcaption>
</figure>
<p>This is what I mean in the talk by reading verdicts instead of diffs. The verdict has an executable basis. It is not just another agent saying it looks good.</p>
<p>The parent still has work to do. It chooses boundaries, resolves interactions, and handles questions the existing checks cannot settle. Independently passing changes can conflict when combined. A forked environment gives a worker somewhere to validate its work; it does not validate the integration on the worker's behalf.</p>
<p>The size of the task you can hand to that worker depends on how far its feedback reaches. With only a compiler, it can come back with code that compiles. With the right harnesses and operational evidence, it can carry a much larger piece of the development lifecycle before it needs an answer from you.</p>
<p>That is why the infrastructure around the agents has become such a large part of our engineering work.</p>
<p>We still design protocols, choose abstractions, and decide what matters. Increasingly, we also build the instruments that let those decisions survive the next implementation, the next agent, and the next deployment.</p>
<p>Every time a person has to answer the same technical question again, there is a place to look for another loop.</p>
  </article>
</main>
