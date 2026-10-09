<script>
  import Seo from "#lib/Seo.svelte";
  import { DEV } from "#lib/site.js";

  // index rows read `name ........ when`
  const work = [
    { name: "indexable", href: "https://ix.dev", when: "2026" },
    { name: "phia", href: "https://www.phia.com", when: "2025" },
    { name: "unikove", href: "https://unikove.com/", when: "2023" },
    { name: "moglix", href: "https://www.moglix.com/", when: "2022" },
  ];

  const projects = [
    {
      name: "BAML",
      href: "https://boundaryml.com",
      repo: "https://github.com/BoundaryML/baml/pulls?q=is:pr+state:merged+author:harivansh-afk",
      when: "2026",
    },
    { name: "dueflow", href: "https://dueflow.co", when: "2026" },
    { name: "uva.builders", href: "https://uva.builders", when: "2026" },
    {
      name: "agentcomputer",
      href: "https://agentcomputer.ai",
      repo: "https://github.com/AgentComputerAI",
      when: "2026",
    },
    {
      name: "CAS",
      href: "https://cas-playbook.vercel.app/",
      repo: "https://github.com/harivansh-afk/cas",
      when: "2026",
    },
  ];

  const ext = { target: "_blank", rel: "noopener noreferrer" };
</script>

<Seo
  title="hari"
  ogTitle="Harivansh Rathi"
  description="i enjoy computer programming, distributed systems and good design, roughly in that order."
/>

<!-- each block hangs off its own place on the page (--off, --w), after
     benja.dev, nudged off the twelfths and spaced unevenly on purpose; under 1152px (960 zoomed) every offset drops and the page is one
     left-aligned column -->
<main class="home">
  <section class="blk first" style:--off="8.333%" style:--w="83.333%" style:--gap="6.5rem">
    <p class="lede">i enjoy computer programming,<br />distributed systems and good design, roughly in that order.</p>
    <p class="aside">i'm currently 20 y/o and a 4th year at <a href="https://www.virginia.edu" {...ext}>UVA</a> where i study <br>computer science</p>
  </section>

  <!-- previously: where i've worked, with the rows attached under it -->
  <section class="blk" style:--off="29%" style:--w="62%" style:--gap="8rem">
    <h2 class="label red">previously</h2>
    <p class="say">
      i was a founding engineer at <a href="https://ix.dev" {...ext}>indexable</a> (YC S26), where we tackled <br>the
      problems of compute overscheduling and VM inefficiency.
    </p>
    <p class="say">
      just before that, i was an early employee at <a href="https://www.phia.com" {...ext}>phia</a>, where i led
      the development <br>of applied ai & automation.<br />in my 9 months there, we went from 0 &rarr; 1M users and raised ~$40M.
    </p>
    <div class="attached">{@render rows(work)}</div>
  </section>


  <section class="blk" style:--off="5%" style:--w="58.333%" style:--gap="5.5rem">
    <h2 class="label">about</h2>
    <p class="say">i enjoy solving difficult problems.</p>
    <p class="aside">lately through compilers and storage systems.</p>
  </section>

  <section class="blk" style:--off="45%" style:--w="47%" style:--gap="9.5rem">
    <h2 class="label amber">projects</h2>
    {@render rows(projects)}
  </section>

  <!-- the last row: the way to the developer screen on the left, set a
       little off the grey paragraph beside it, which says the rest quietly -->
  <section class="blk last" style:--off="8.333%" style:--w="83.333%" style:--gap="8rem">
    <div class="dev-link">
      <h2 class="label navy">dev stuff</h2>
      <p class="say"><a class="crt" href="{DEV}/">harivan.sh</a></p>
    </div>
    <div class="quiet" aria-label="more about me">
      <p>
        i grew up building robots. <br> in 2019 i represented my country at the
        <a
          href="https://www.facebook.com/roboclubonline/posts/roboclub-team-supercalifragilisticexpialidocious-at-the-first-lego-league-nation/1565656036804624/"
          {...ext}>FIRST world championship</a
        > where my team placed 9th. a few years later, at age 9 i became a
        <a href="https://www.worldcubeassociation.org/persons/2015RATH01" {...ext}>competitive cuber</a>.
      </p>
    </div>
  </section>
</main>

{#snippet rows(items)}
  <ul class="rows">
    {#each items as item}
      <li>
        {#if item.repo}
          <!-- links can't nest: the name's link stretches over the row and
               the github mark sits above it -->
          <div class="row">
            <span class="name"
              ><a class="bare stretch" href={item.href} {...ext}>{item.name}</a>{#if item.tag}<span class="tag">{item.tag}</span>{/if}</span
            ><span class="end"><a
                class="bare gh"
                href={item.repo}
                aria-label="{item.name} on github"
                {...ext}
                ><svg viewBox="0 0 16 16" aria-hidden="true"
                  ><path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                  /></svg
                ></a
              >{#if item.when}<span class="fig">{item.when}</span>{/if}</span
            >
          </div>
        {:else}
          <a class="row bare" href={item.href} {...ext}
            ><span class="name">{item.name}{#if item.tag}<span class="tag">{item.tag}</span>{/if}</span>{#if item.when}<span class="fig">{item.when}</span>{/if}</a
          >
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<style>
  /* one size for everything read on this page; only labels and figures
     (the pixel face) are smaller */
  .lede {
    max-width: 66ch;
    font-size: var(--text);
    line-height: 1.4;
    color: var(--fg);
    text-wrap: pretty;
  }
  .say {
    max-width: 64ch;
    font-size: var(--text);
    line-height: 1.4;
    color: var(--fg);
  }
  .say + .say {
    margin-top: 0.9rem;
  }
  /* a quieter second line under a statement */
  .aside {
    max-width: 64ch;
    margin-top: 0.35rem;
    font-size: var(--text);
    line-height: 1.4;
  }
  .rows {
    font-size: var(--text);
  }
  .attached {
    margin-top: 2.25rem;
    max-width: calc(64ch + 1rem);
  }

  /* a row with a repo: the name's link covers the row, the mark sits on top */
  .rows li {
    position: relative;
  }
  .stretch::after {
    content: "";
    position: absolute;
    inset: 0;
  }
  .gh {
    position: relative;
    z-index: 1;
    color: var(--faint);
    transition: color 0.15s;
  }
  /* the mark sits just left of the date */
  .end {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .gh svg {
    display: block;
    width: 0.8125rem;
    height: 0.8125rem;
  }
  .gh:hover,
  .gh:focus-visible {
    color: var(--fg);
  }

  /* a small word after a row's name, in the label voice */
  .tag {
    margin-left: 0.75rem;
    font-family: var(--pixel);
    font-size: var(--pixel-size);
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
  /* harivan.sh hovers as a glimpse of its own screen: the navy, the
     off-white, the crt glow and scanlines (developer/+page.svelte) */
  .crt:is(:hover, :focus-visible) {
    background:
      repeating-linear-gradient(#0000 0 2px, #00000038 2px 3px),
      #1e2139;
    color: #e9e9ec;
    text-shadow:
      0 0 1px color-mix(in srgb, currentColor 45%, transparent),
      0 0 6px color-mix(in srgb, currentColor 30%, transparent),
      0.5px 0 0 #ff46463a,
      -0.5px 0 0 #4696ff3a;
  }
  /* on the way in it tears for a third of a second: the colour fringe
     blows out and slices of the screen itself, in its own face, flash over
     the word. the slice rests invisible so the face is loaded before the
     first hover */
  .crt {
    position: relative;
  }
  .crt::after {
    content: "harivan.sh";
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background:
      repeating-linear-gradient(#0000 0 2px, #00000038 2px 3px),
      #1e2139;
    color: #e9e9ec;
    font-family: "Iosevka Charon Mono", var(--mono);
    -webkit-text-stroke: 0;
    opacity: 0;
    pointer-events: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    .crt:is(:hover, :focus-visible) {
      animation: fringe 0.32s steps(2);
    }
    .crt:is(:hover, :focus-visible)::after {
      animation: slip 0.32s steps(1);
    }
  }
  @keyframes fringe {
    from { text-shadow: 2px 0 #ff4646, -2px 0 #4696ff }
  }
  @keyframes slip {
    10% { opacity: 1; clip-path: inset(0 0 55% 0); transform: translateX(3px) }
    25% { opacity: 1; clip-path: inset(0); transform: none }
    70% { opacity: 1; clip-path: inset(40% 0 0 0); transform: translateX(-2px) }
    85%, 100% { opacity: 0 }
  }
  .quiet {
    display: grid;
    gap: 0.9rem;
    max-width: 42ch;
    font-size: var(--text);
    line-height: 1.4;
  }
</style>
