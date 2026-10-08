<script>
  import Seo from "#lib/Seo.svelte";
  import { DEV, crossTo } from "#lib/site.js";

  // the developer screen is on its own domain; a plain click crosses to it
  // like a crt switching over (site.js)
  function cross(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    crossTo(`${DEV}/`);
  }

  // index rows read `name ........ when`
  const work = [
    { name: "indexable", href: "https://ix.dev", when: "2026" },
    { name: "phia", href: "https://www.phia.com", when: "2025" },
    { name: "unikove", href: "https://unikove.com/", when: "2023" },
    { name: "moglix", href: "https://www.moglix.com/", when: "2022" },
  ];

  const projects = [
    { name: "BAML", href: "https://boundaryml.com", when: "2026" },
    { name: "dueflow", href: "https://dueflow.co", when: "2026" },
    { name: "uva.builders", href: "https://uva.builders", when: "2026" },
    { name: "companion", href: "https://companion.ai", when: "2026" },
    {
      name: "content addressable storage",
      href: "https://cas-playbook.vercel.app/",
      tag: "research",
      when: "2026",
    },
  ];

  const ext = { target: "_blank", rel: "noopener noreferrer" };
</script>

<Seo
  title="hari"
  ogTitle="Harivansh Rathi"
  description="performant distributed systems and beautiful consumer experiences"
/>

<!-- each block hangs off its own place on the page (--off, --w), after
     benja.dev, nudged off the twelfths and spaced unevenly on purpose; under 1152px (960 zoomed) every offset drops and the page is one
     left-aligned column -->
<main class="home">
  <section class="blk first" style:--off="16.667%" style:--w="75%" style:--gap="6.5rem">
    <p class="lede">i enjoy computer programming,<br />distributed systems and good design, roughly in that order.</p>
    <p class="aside">i'm a 20 y/o fourth year at <a href="https://www.virginia.edu" {...ext}>UVA</a>.</p>
  </section>

  <!-- previously: where i've worked, with the rows attached under it -->
  <section class="blk" style:--off="29%" style:--w="50%" style:--gap="8rem">
    <h2 class="label red">previously</h2>
    <p class="say">
      i was a founding engineer at <a href="https://ix.dev" {...ext}>indexable</a> (YC S26), where we tackled the
      problems of compute overscheduling and VM inefficiency.
    </p>
    <p class="say">
      just before that, i was an early employee at <a href="https://www.phia.com" {...ext}>phia</a>, where i led
      automation system development.<br />in my 9 months there, we went from 0 &rarr; 1M users and raised $40M.
    </p>
    <div class="attached">{@render rows(work)}</div>
  </section>


  <section class="blk" style:--off="5%" style:--w="58.333%" style:--gap="5.5rem">
    <h2 class="label amber">about</h2>
    <p class="say">i enjoy solving difficult problems.</p>
    <p class="aside">lately, compilers and storage systems have been how i scratch that itch.</p>
  </section>

  <section class="blk" style:--off="45%" style:--w="47%" style:--gap="9.5rem">
    <h2 class="label blue">projects</h2>
    {@render rows(projects)}
  </section>

  <!-- the last row: the way to the developer screen on the left, set a
       little off the grey paragraph beside it, which says the rest quietly -->
  <section class="blk last" style:--off="8.333%" style:--w="83.333%" style:--gap="8rem">
    <div class="dev-link">
      <h2 class="label navy">developer</h2>
      <p class="say"><a href="{DEV}/" onclick={cross}>harivan.sh</a></p>
    </div>
    <div class="quiet" aria-label="more about me">
      <p>
        i grew up building robots. in 2019 i represented my country at the
        <a
          href="https://www.facebook.com/roboclubonline/posts/roboclub-team-supercalifragilisticexpialidocious-at-the-first-lego-league-nation/1565656036804624/"
          {...ext}>FIRST world championship</a
        >, where my team placed 9th. a few years later, at age 9 i became a
        <a href="https://www.worldcubeassociation.org/persons/2015RATH01" {...ext}>competitive speedcuber</a>.
      </p>
    </div>
  </section>
</main>

{#snippet rows(items)}
  <ul class="rows">
    {#each items as item}
      <li>
        <a class="row bare" href={item.href} target="_blank" rel="noopener noreferrer"
          ><span class="name">{item.name}{#if item.tag}<span class="tag">{item.tag}</span>{/if}</span>{#if item.when}<span class="fig">{item.when}</span>{/if}</a
        >
      </li>
    {/each}
  </ul>
{/snippet}

<style>
  /* one size for everything read on this page; only labels and figures
     (the pixel face) are smaller */
  .lede {
    max-width: 66ch;
    font-size: 0.9375rem;
    line-height: 1.65;
    color: var(--fg);
    text-wrap: pretty;
  }
  .say {
    max-width: 52ch;
    font-size: 0.9375rem;
    line-height: 1.65;
    color: var(--fg);
  }
  .say + .say {
    margin-top: 0.9rem;
  }
  /* a quieter second line under a statement */
  .aside {
    max-width: 52ch;
    margin-top: 0.35rem;
    font-size: 0.9375rem;
    line-height: 1.65;
  }
  .rows {
    font-size: 0.9375rem;
  }
  .attached {
    margin-top: 2.25rem;
    max-width: calc(52ch * 15 / 14 + 1rem);
  }

  /* a small word after a row's name, in the label voice */
  .tag {
    margin-left: 0.75rem;
    font-family: var(--pixel);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--faint);
  }
  /* the last row: developer stuff in the empty quarter at 2/12 to 5/12,
     dropped a few lines below the grey paragraph's top so the two don't
     line up exactly; the paragraph starts at 7/12 (60% of this block) */
  .last {
    display: grid;
    gap: 3rem;
  }
  @media (min-width: 1152px) {
    .last {
      grid-template-columns: 60% minmax(0, 1fr);
      gap: 0;
    }
    .dev-link {
      margin: -2.5rem 0 0 10%;
    }
  }
  .quiet {
    display: grid;
    gap: 0.9rem;
    max-width: 42ch;
    font-size: 0.9375rem;
    line-height: 1.65;
  }
</style>
