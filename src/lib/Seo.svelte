<script>
  import { page } from "$app/state";

  let { title, description, ogTitle = title } = $props();

  const url = $derived(`https://harivan.sh${page.url.pathname}`);
  const image = "https://harivan.sh/og.png";
  const imageAlt = "hari";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
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
