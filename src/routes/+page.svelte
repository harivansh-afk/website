<script>
  import Seo from "$lib/Seo.svelte";
  import Projects from "$lib/Projects.svelte";
  import WorkList from "$lib/WorkList.svelte";
  import ThoughtsList from "$lib/ThoughtsList.svelte";
  import ResearchList from "$lib/ResearchList.svelte";
</script>

<Seo
  title="hari"
  ogTitle="Harivansh Rathi"
  description="performant distributed systems and beautiful consumer experiences"
/>

<main>
  <p>Hey, i'm Hari</p>

  <p>
    i'm a 20 y/o software engineer.<br />
    i enjoy building performant distributed systems and designing beautiful consumer experiences
  </p>

  <p>
    i'm currently a fourth year student at the University Of Virginia and Founding Engineer at
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
      href="https://www.linkedin.com/company/phia-co/"
      target="_blank"
      rel="noopener noreferrer"
      data-preview="phia">phia</a
    >, where i led internal + marketing automation system development<br />
    in my 9 months there, we went from 0 &rarr; 1M users and raised $35M
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
    > and self-host most of
    <a
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

  <!-- mobile is one scrollable page: the other sections render here (lazy
       media, so the desktop-hidden rows fetch nothing) and the nav is gone -->
  <div class="one-page">
    <section>
      <h2>work</h2>
      <WorkList />
    </section>
    <section>
      <h2>projects</h2>
      <Projects lazy />
    </section>
    <section>
      <h2>thoughts</h2>
      <ThoughtsList />
    </section>
    <section>
      <h2>research</h2>
      <ResearchList />
    </section>
  </div>
</main>

<style>
  .one-page {
    display: none;
  }
  @media (max-width: 640px) {
    .one-page {
      display: block;
    }
  }
</style>
