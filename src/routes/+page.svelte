<script>
  import Seo from "#lib/Seo.svelte";

  // index rows read `name ........ when`
  const work = [
    { name: "indexable", href: "https://ix.dev", when: "summer 2026" },
    { name: "phia", href: "https://www.phia.com", when: "summer & fall 2025" },
    { name: "unikove", href: "https://unikove.com/", when: "summer 2023" },
    { name: "moglix", href: "https://www.moglix.com/", when: "summer 2022" },
  ];

  const projects = [
    { name: "BAML", href: "https://boundaryml.com", when: "fall 2026" },
    { name: "dueflow", href: "https://dueflow.co", when: "fall 2026" },
    { name: "uva.builders", href: "https://uva.builders", when: "fall 2026" },
    { name: "companion", href: "https://companion.ai", when: "spring 2026" },
  ];

  const ext = { target: "_blank", rel: "noopener noreferrer" };
</script>

<Seo
  title="hari"
  ogTitle="Harivansh Rathi"
  description="performant distributed systems and beautiful consumer experiences"
/>

<!-- each block hangs off its own twelfth of the page (--off, --w), after
     benja.dev; under 1152px (960 zoomed) every offset drops and the page is one
     left-aligned column -->
<main class="home">
  <section class="blk first" style:--off="16.667%" style:--w="75%" style:--gap="9rem">
    <p class="lede">i enjoy computer programming,<br />distributed systems and good design, roughly in that order.</p>
    <p class="aside">i'm a 20 y/o fourth year at <a href="https://www.virginia.edu" {...ext}>UVA</a>.</p>
  </section>

  <!-- work: what i do, with everywhere i've worked attached under it -->
  <section class="blk" style:--off="27%" style:--w="50%">
    <h2 class="label red">work</h2>
    <p class="say">
      i'm a Founding Engineer at <a href="https://ix.dev" {...ext}>indexable</a> (YC S26). We build powerful,
      persistent virtual machine infrastructure, tackling the problem of compute overscheduling and filesystem
      inefficiency.
    </p>
    <p class="say">
      just before that, i was an early employee at <a href="https://www.phia.com" {...ext}>phia</a>, where i led
      automation system development. in my 9 months there, we went from 0 &rarr; 1M users and raised $40M.
    </p>
    <div class="attached">{@render rows(work)}</div>
  </section>


  <section class="blk" style:--off="8.333%" style:--w="58.333%">
    <h2 class="label amber">about</h2>
    <p class="say">i enjoy solving difficult problems.</p>
    <p class="aside">lately, compilers and storage systems have been how i scratch that itch.</p>
  </section>

  <section class="blk" style:--off="41.667%" style:--w="50%" style:--gap="4.5rem">
    <h2 class="label blue">projects</h2>
    {@render rows(projects)}
  </section>

  <!-- the rest, greyed out: no label, said quietly -->
  <section class="blk quiet" style:--off="58.333%" style:--w="33.333%" style:--gap="8rem" aria-label="more about me">
    <p>
      i grew up building robots. in 2019 i represented my country at the
      <a
        href="https://www.facebook.com/roboclubonline/posts/roboclub-team-supercalifragilisticexpialidocious-at-the-first-lego-league-nation/1565656036804624/"
        {...ext}>FIRST world championship</a
      >, where my team placed ninth. a few years earlier, at nine, i was
      <a href="https://www.worldcubeassociation.org/persons/2015RATH01" {...ext}>competing in speedcubing</a>. i believe
      in open source, and i <a href="https://git.harivan.sh/harivansh-afk/nix" {...ext}>self-host</a> most of the
      software i use on my own hardware.
    </p>
  </section>
</main>

{#snippet rows(items)}
  <ul class="rows">
    {#each items as item}
      <li>
        <a class="row bare" href={item.href} target="_blank" rel="noopener noreferrer"
          ><span class="name">{item.name}</span>{#if item.when}<span class="fig">{item.when}</span>{/if}</a
        >
      </li>
    {/each}
  </ul>
{/snippet}

<style>
  .lede {
    max-width: 66ch;
    font-size: 1.0625rem;
    line-height: 1.55;
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
  .attached {
    margin-top: 2.25rem;
    max-width: calc(52ch * 15 / 14 + 1rem);
  }

  .quiet {
    display: grid;
    gap: 0.9rem;
    max-width: 42ch;
    font-size: 0.8125rem;
    line-height: 1.75;
  }
</style>
