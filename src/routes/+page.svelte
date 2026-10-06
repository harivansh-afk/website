<script>
  import Seo from "#lib/Seo.svelte";

  // the index, in reading order (the order mobile stacks them in). `col` is the
  // desktop index column a section sits in. an item reads `<link>, note`; the
  // note (a date or a status) is optional, `preview` names a hover shot or,
  // ending in .mp4, a hover clip
  const sections = [
    {
      name: "work",
      col: 0,
      items: [
        {
          name: "indexable",
          href: "https://github.com/indexable-inc/",
          preview: "indexable",
          note: "summer 2026",
        },
        {
          name: "phia",
          href: "https://www.linkedin.com/company/phia-co/",
          preview: "phia",
          note: "summer & fall 2025",
        },
        { name: "unikove", href: "https://unikove.com/", note: "summer 2023" },
        { name: "moglix", href: "https://www.moglix.com/", note: "summer 2022" },
      ],
    },
    {
      name: "projects",
      col: 1,
      items: [
        { name: "BAML", href: "https://boundaryml.com", preview: "baml", note: "fall 2026" },
        { name: "dueflow", href: "https://dueflow.co", preview: "dueflow", note: "fall 2026" },
        { name: "uva.builders", href: "https://uva.builders", preview: "uva-builders", note: "fall 2026" },
        { name: "companion", href: "https://companion.ai", preview: "companion", note: "spring 2026" },
      ],
    },
    {
      name: "thoughts",
      col: 0,
      items: [
        { name: "ai psychosis", href: "https://x.com/HarivanshRathi/status/2105361997776794095", note: "September, 2026"},
        { name: "deterministic state", href: "/thoughts/sans-io/", note: "September 2026" },
        { name: "the autonomy radius", href: "/thoughts/the-autonomy-radius/", note: "September 2026" },
        { name: "core principles", href: "/thoughts/my-core-principles/", note: "May 2025" },
      ],
    },
    {
      name: "research",
      col: 0,
      items: [{ name: "CAS", href: "https://cas-playbook.vercel.app/", note: "fall 2026" }],
    },
    {
      name: "software",
      col: 1,
      items: [
        { name: "Mixbridge", href: "https://mixbridge.app/", preview: "mixbridge.mp4" },
        { name: "TouchTips", href: "https://touchtips.app", preview: "touchtips.mp4" },
        {
          name: "Einstein AI",
          href: "https://www.cnet.com/tech/services-and-software/companion-einstein-ai-tool/",
          preview: "einstein",
          note: "cease and desisted :(",
        },
        { name: "Mux", href: "https://git.harivan.sh/harivansh-afk/mux", preview: "mux.mp4" },
        { name: "Pierrejo", href: "https://git.harivan.sh/harivansh-afk/pierrejo", preview: "pierrejo.mp4" },
        { name: "Draw", href: "https://git.harivan.sh/harivansh-afk/draw", preview: "draw.mp4" },
        { name: "AgentComputer", href: "https://github.com/AgentComputerAI", preview: "agentcomputer.mp4", note: "no longer maintained" },
      ],
    },
  ].map((section, order) => ({ ...section, order }));

  const columns = [0, 1].map((col) => sections.filter((section) => section.col === col));
</script>

<Seo
  title="hari"
  ogTitle="Harivansh Rathi"
  description="performant distributed systems and beautiful consumer experiences"
/>

<main>
  <section class="about">
    <h1>Hey, i'm <span>Hari</span></h1>

    <p>
      i'm a 20 y/o fourth year at the <a href="https://www.virginia.edu">University Of Virginia</a><br />
      i enjoy computer programming, distributed systems and good design
    </p>

    <p>
      i'm a Founding Engineer at
      <a href="https://ix.dev" target="_blank" rel="noopener noreferrer" data-preview="ix"
        >indexable</a
      >
      (YC S26).<br />
      We build powerful, persistent virtual machine infrastructure, tackling the problem of compute
      overscheduling and filesystem inefficiency
    </p>

    <p>
      just before that, i was an early employee at
      <a
        href="https://www.phia.com"
        target="_blank"
        rel="noopener noreferrer"
        data-preview="phia">phia</a
      >, where i led automation system development<br />
      in my 9 months there, we went from 0 &rarr; 1M users and raised $40M
    </p>

    <p>
      i grew up interested in
      <a
        href="https://www.facebook.com/roboclubonline/posts/roboclub-team-supercalifragilisticexpialidocious-at-the-first-lego-league-nation/1565656036804624/"
        target="_blank"
        rel="noopener noreferrer"
        data-preview="fll">robotics</a
      >
      and represented my country in the
      <a href="https://www.firstinspires.org/" target="_blank" rel="noopener noreferrer">FIRST</a>
      world championships in 2019, placing 9th world-wide
    </p>

    <p>
      i've always been a problem solver and dabbled in
      <a
        href="https://www.worldcubeassociation.org/persons/2015RATH01"
        target="_blank"
        rel="noopener noreferrer"
        data-preview="wca">competitive cubing</a
      > when i was 9 y/o
    </p>

    <p>
      i'm a strong supporter of
      <a href="https://opensource.org/about" target="_blank" rel="noopener noreferrer"
        >open source initiative</a
      > and self-host most of&nbsp;<a
        href="https://git.harivan.sh/harivansh-afk/nix"
        target="_blank"
        rel="noopener noreferrer"
        data-preview="dotfiles">my software</a
      > on personal compute
    </p>

    <p>
      you can find me on
      <a
        href="https://github.com/harivansh-afk"
        target="_blank"
        rel="noopener noreferrer"
        data-preview="heatmap">github</a
      >,
      <a href="https://linkedin.com/in/harivansh-rathi" target="_blank" rel="noopener noreferrer"
        >linkedin</a
      >
      or
      <a href="https://x.com/HarivanshRathi" target="_blank" rel="noopener noreferrer">x.com</a>
    </p>
  </section>

  <div class="index">
    {#each columns as column}
      <div class="column">
        {#each column as section}
          <section style:order={section.order}>
            <h2>{section.name}</h2>
            <ul>
              {#each section.items as item}
                {@const external = item.href.startsWith("http")}
                <li>
                  <a
                    href={item.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    data-preview={item.preview}>{item.name}</a
                  >{#if item.note}, <span class="note">{item.note}</span>{/if}
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    {/each}
  </div>
</main>

<style>
  /* the whole site is this page, split in two: the about prose on the left,
     the index on the right, both starting on the same line. set smaller than
     the articles so it fits one screen, and centered vertically when it does.
     lengths are in em of that size */
  main {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    column-gap: 5em;
    align-content: center;
    align-items: start;
    max-width: calc(86em + 3rem);
    min-height: 100svh;
    font-size: 0.75rem;
  }

  .about {
    display: flex;
    flex-direction: column;
    gap: 1.15em;
  }
  .about :is(h1, p) {
    margin: 0;
  }
  /* the greeting reads as the first line of the prose, not a title */
  h1 {
    font-size: 1em;
    color: inherit;
  }
  h1 span {
    color: var(--fg);
  }

  /* linked names carry the foreground colour; the underline is the global
     muted dashed one from style.css */
  a {
    color: var(--fg);
  }

  /* two columns of sections; each section is a small label and its items */
  .index {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2.85em;
  }
  .column {
    display: flex;
    flex-direction: column;
    gap: 2.6em;
  }
  .index h2 {
    margin: 0 0 0.85em;
    font-size: 1em;
    font-style: italic;
    font-synthesis: style;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }
  /* a long row breaks after its comma, never inside the note */
  .note {
    white-space: nowrap;
  }
  ul {
    display: flex;
    flex-direction: column;
    gap: 0.6em;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* too narrow for two halves: the index drops under the prose */
  @media (max-width: 960px) {
    main {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 4em;
    }
  }

  /* mobile: one column at the body size, sections in reading order */
  @media (max-width: 640px) {
    main {
      display: block;
      min-height: 0;
      font-size: inherit;
    }
    .index {
      display: flex;
      flex-direction: column;
      gap: 2em;
      margin-top: 2.5em;
    }
    .column {
      display: contents;
    }
  }
</style>
