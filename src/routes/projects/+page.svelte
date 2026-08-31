<script>
  const title = "projects";
  const description = "things i've built";

  // videos ship preload="metadata" (first frame only, ~a few hundred KB for
  // the whole page instead of 18MB); this action streams and plays each one
  // as it approaches the viewport, and pauses it on the way out
  function lazyplay(node) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) node.play();
        else node.pause();
      },
      { rootMargin: "300px" },
    );
    io.observe(node);
    return { destroy: () => io.disconnect() };
  }

  // media lives in static/previews (shared with the hover previews, same
  // cache-busted urls)
  const V = "12";
  const projects = [
    {
      name: "mixbridge",
      href: "https://mixbridge.app/",
      media: "mixbridge.mp4",
      phone: true, // raw iphone screen recording: media carries the screen's rounded corners
      desc: "a beautiful, seamless listening experience with a built-in ai dj",
    },
    {
      name: "agentcomputer",
      href: "https://github.com/AgentComputerAI",
      media: "agentcomputer.mp4",
      desc: "isolated cloud computers for ai agents",
      note: "no longer maintained",
    },
    {
      name: "einstein ai",
      href: "https://www.cnet.com/tech/services-and-software/companion-einstein-ai-tool/",
      media: "einstein.webp",
      desc: "ai agent that does your canvas assignments autonomously",
      note: "cease and desisted",
    },
    {
      name: "mux",
      href: "https://git.harivan.sh/harivansh-afk/mux",
      media: "mux.mp4",
      desc: "a stateless macos native multiplexer using ghosttykit",
    },
    {
      name: "pierrejo",
      href: "https://git.harivan.sh/harivansh-afk/pierrejo",
      media: "pierrejo.mp4",
      desc: "beautiful diff viewing for forgejo",
    },
    {
      name: "nap",
      href: "https://git.harivan.sh/harivansh-afk/nap",
      media: "nap.mp4",
      desc: "Not Airplay™",
      desc2: "a system to use a linux computer as an extended monitor in real time",
    },
    {
      name: "deskctl",
      href: "https://deskctl.dev",
      media: "deskctl.mp4",
      desc: "non-interactive x11 desktop control for ai agents",
      note: "no longer maintained",
    },
    {
      name: "betterNAS",
      href: "https://betternas.com",
      media: "betternas.webp",
      desc: "macos native filesystem admin over http",
      note: "no longer maintained",
    },
  ];
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Harivansh Rathi" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="https://harivan.sh/projects/" />
  <meta property="og:image" content="https://harivan.sh/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Harivansh Rathi - distributed systems and ai computers" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://harivan.sh/og.png" />
</svelte:head>

<main>
  <section>
    {#each projects as p, i}
      <div class="project" style="--i: {i}">
        <a
          class="thumb"
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          tabindex="-1"
          aria-hidden="true"
        >
          {#if p.media.endsWith(".mp4")}
            <video
              class={p.phone ? "phone" : ""}
              src="/previews/{p.media}?v={V}"
              preload="metadata"
              use:lazyplay
              muted
              loop
              playsinline
            ></video>
          {:else}
            <img
              class={p.phone ? "phone" : ""}
              src="/previews/{p.media}?v={V}"
              alt=""
              loading="lazy"
            />
          {/if}
        </a>
        <div class="info">
          <a href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a>
          {#if p.desc}
            <p>{p.desc}</p>
          {/if}
          {#if p.desc2}
            <p>{p.desc2}</p>
          {/if}
          {#if p.note}
            <p class="note">({p.note})</p>
          {/if}
        </div>
      </div>
    {/each}
  </section>
</main>
