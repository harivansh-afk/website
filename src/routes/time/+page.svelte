<script>
  import { onMount } from "svelte";

  const bookingUrl = "https://cal.com/harivansh-rathi-9psfls";

  onMount(() => {
    window.location.replace(bookingUrl);
  });
</script>

<svelte:head>
  <title>Book a time — Harivansh Rathi</title>
  <meta name="robots" content="noindex" />
  <meta http-equiv="refresh" content={`0;url=${bookingUrl}`} />
</svelte:head>

<main>
  <h1>Book a time</h1>
  <p>Redirecting to my booking page. <a href={bookingUrl}>Continue to Cal.com</a>.</p>
</main>
