<script>
  import Seo from "$lib/Seo.svelte";

  const title = "core principles";
</script>

<Seo {title} description="As someone in persuit of an extraordinary life, I live by some core principles adapted from the behavior of my grandparents" />

<main class="thought">
  <nav><a href="/" class="back-link">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">May 2025</p>
    </header>
    <ol>
      <li>
        How you do <mark>anything</mark> is how you do <mark>everything</mark>.
      </li>
      <li>
        <mark>Action is the antidote to anxiety.</mark> Thinking, planning, or talking about doing the thing
        isn’t the same as <mark>doing the thing</mark>.
      </li>
      <li><mark>Weird</mark> will always win. Normal actions guarantee <mark>normal results</mark>.</li>
      <li>
        Discomfort is the <mark>cost of growth</mark>. The lonely, uncertain chapter is the <mark>rite of passage</mark> for
        anyone chasing greatness.
      </li>
      <li>
        Faith is built through <mark>self-trust</mark>. If you <mark>break promises to yourself</mark>, consistency doesn’t
        compound into confidence.
      </li>
      <li>
        Every attempt that doesn’t work is still <mark>forward motion</mark> toward the one that will. Even if
        you don’t win, you can <mark>lose better</mark>.
      </li>
      <li>
        <mark>Criticism and Insecurity</mark> kill more dreams than incompetence ever will. This roots at taking
        advice from people living <mark>lives you don’t want</mark>.
      </li>
      <li>
        The magic you seek is in the <mark>work you avoid</mark>. What feels <mark>boring and uncomfortable</mark> is often
        where the real progress hides.
      </li>
      <li>
        Passion is <mark>created, not found</mark>. You fall in love with what you become good at through
        <mark>repetition and resilience</mark>.
      </li>
      <li>
        <mark>Never multiply by zero.</mark> Avoid self-destructive choices that can erase years of effort, <mark>hedge
        your downside</mark>.
      </li>
      <li>
        You can be anything, do anything, but <mark>not everything</mark>. Trade-offs are what define excellence
        and build your character, <mark>pick your hill</mark> and die on it proudly.
      </li>
      <li>The grass is greener where you <mark>decide to water it</mark>.</li>
    </ol>
  </article>
</main>

<style>
  mark {
    background: #564b24;
    color: var(--fg);
    padding-inline: 0.12em;
    border-radius: 0.15em;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  @media (prefers-color-scheme: light) {
    mark {
      background: #f5e7ae;
    }
  }
</style>
