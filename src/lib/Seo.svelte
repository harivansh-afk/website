<script>
  import { page } from "$app/state";
  import { CAFE } from "#lib/site.js";

  // `url` overrides the canonical address (the developer screen's is
  // harivan.sh); every other page's is its path on hari.cafe
  let { title, description, ogTitle = title, url: canonical } = $props();

  const url = $derived(canonical ?? `${CAFE}${page.url.pathname}`);
  const image = `${CAFE}/og.png?rev=fd30ac8b`;
  const imageAlt = "hari";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Harivansh Rathi" />
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={imageAlt} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>
