<script>
  import Seo from "#lib/Seo.svelte";

  // index rows read `name ........ when`
  const previously = [
    { name: "indexable", href: "https://ix.dev", when: "2026" },
    { name: "phia", href: "https://www.phia.com", when: "2025" },
    { name: "unikove", href: "https://unikove.com/", when: "2023" },
    { name: "moglix", href: "https://www.moglix.com/", when: "2022" },
  ];

  const projects = [
    { name: "BAML", href: "https://boundaryml.com", when: "fall 2026" },
    { name: "dueflow", href: "https://dueflow.co", when: "fall 2026" },
    { name: "uva.builders", href: "https://uva.builders", when: "fall 2026" },
    { name: "CAS", href: "https://cas-playbook.vercel.app/", when: "research, fall 2026" },
    { name: "companion", href: "https://companion.ai", when: "spring 2026" },
  ];
</script>

<Seo
  title="hari"
  ogTitle="Harivansh Rathi"
  description="i build infrastructure that keeps its promises, and software that feels obvious."
/>

<!-- each block hangs off its own twelfth of the page (--off, --w), after
     benja.dev; under 960px every offset drops and the page is one
     left-aligned column -->
<main class="home">
  <section class="blk first" style:--off="16.667%" style:--w="58.333%" style:--gap="9rem">
    <h1 class="lede">i build infrastructure that keeps its promises, and software that feels obvious.</h1>
    <p class="sub">weird will always win.</p>
  </section>

  <section class="blk" style:--off="25%" style:--w="50%">
    <h2 class="label red">lately</h2>
    <p class="say">
      i was a founding engineer at <a href="https://ix.dev" target="_blank" rel="noopener noreferrer">indexable</a>
      (YC S26). we built persistent virtual machine infrastructure, and spent most of our time on two problems:
      compute overscheduling and filesystem inefficiency.
    </p>
    <p class="say">
      before that, i was an early employee at
      <a href="https://www.phia.com" target="_blank" rel="noopener noreferrer">phia</a>, where i led automation
      systems. in my nine months there, we went from zero to a million users and raised $40M.
    </p>
  </section>

  <section class="blk" style:--off="8.333%" style:--w="58.333%">
    <h2 class="label">previously</h2>
    {@render rows(previously)}
  </section>

  <section class="blk" style:--off="41.667%" style:--w="50%">
    <h2 class="label">projects</h2>
    {@render rows(projects)}
  </section>

  <section class="blk about" style:--off="33.333%" style:--w="66.667%" style:--gap="8rem">
    <div class="a">
      <h2 class="label amber">about</h2>
      <p class="say">i like computer programming, distributed systems and good design, roughly in that order.</p>
    </div>
    <div class="b quiet">
      <p>
        i'm twenty, in my fourth year at <a href="https://www.virginia.edu" target="_blank" rel="noopener noreferrer"
          >uva</a
        >.
      </p>
      <p>
        i grew up building robots. in 2019 i represented my country at the
        <a
          href="https://www.facebook.com/roboclubonline/posts/roboclub-team-supercalifragilisticexpialidocious-at-the-first-lego-league-nation/1565656036804624/"
          target="_blank"
          rel="noopener noreferrer">FIRST world championship</a
        >, where my team placed ninth. a few years earlier, at nine, i was
        <a href="https://www.worldcubeassociation.org/persons/2015RATH01" target="_blank" rel="noopener noreferrer"
          >competing in speedcubing</a
        >.
      </p>
      <p>
        i believe in open source, and i
        <a href="https://git.harivan.sh/harivansh-afk/nix" target="_blank" rel="noopener noreferrer">self-host</a> most
        of the software i use on my own hardware.
      </p>
    </div>
  </section>
</main>

{#snippet rows(items)}
  <ul class="rows">
    {#each items as item}
      <li>
        <a class="row bare" href={item.href} target="_blank" rel="noopener noreferrer"
          ><span class="name">{item.name}</span><span class="fig">{item.when}</span></a
        >
      </li>
    {/each}
  </ul>
{/snippet}

<style>
  .lede {
    max-width: 46ch;
    font-size: 1.0625rem;
    line-height: 1.55;
    color: var(--fg);
    text-wrap: balance;
  }
  .sub {
    margin-top: 0.75rem;
    font-size: 0.8125rem;
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
  .quiet {
    max-width: 42ch;
    font-size: 0.8125rem;
    line-height: 1.75;
  }

  /* about, after benja.dev's last block: the label and conviction on the
     left half, the biography on the right half, dropped a few lines */
  .about {
    display: grid;
    gap: 1.25rem;
  }
  .about .say {
    max-width: 30ch;
  }
  .about .b {
    display: grid;
    gap: 0.9rem;
  }
  @media (min-width: 960px) {
    .about {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 2.5rem;
    }
    .about .b {
      margin-top: 6.5rem;
    }
  }
</style>
