<script>
  import Seo from "$lib/Seo.svelte";

  const title = "throw out your macbook";
</script>

<Seo {title} description="Throw out your macbook." />

<main class="thought">
  <nav><a href="/" class="back-link">..</a></nav>
  <article>
    <header>
      <h1>{title}</h1>
      <p class="meta">April 2026</p>
    </header>
    <p>I want to run multiple productive coding agents.</p>
    <p>But any time I run more than 4 agents on my 16gb macbook, it starts crying.</p>
    <p>Most agent hosting providers today give you something closer to a container than a vm.</p>
    <p>A bare shell, some random packages, no skills, no secrets, and most of them have ref-linked filesystem mounts so your agents are already using shitty 1990s file transfer speeds.</p>
    <p>I tried the cheapest “real” provider I could find (<a href="https://www.netcup.com/" target="_blank" rel="noopener noreferrer">netcup</a>) and spent ~2 hours clicking around their shitty UI and setting up the VM from scratch.</p>
    <p>This is not acceptable.</p>
    <p>I (and by extension my agents) need 4 things to be productive in any environment:</p>
    <p>Secrets, packages, shell aliases, dotfiles.</p>
    <p>Without these the agent ends up working in a worse environment than I do, and whatever it produces by extension is bottlenecked.</p>
    <p>The stack I use for reproducible environments (or something similar like <a href="https://www.gnu.org/software/stow/" target="_blank" rel="noopener noreferrer">stow</a>) feels more like a requirement at this point than a nice-to-have.</p>
    <p>Even if <a href="https://red.anthropic.com/2026/mythos-preview/" target="_blank" rel="noopener noreferrer">mythos</a> / better models arrive tomorrow, we are effectively bottlenecking the agent before we even give it a prompt.</p>
    <p>The fix is disposable environments, and to get there you have to join the functional gang.</p>
    <p><a href="https://nixos.org/" target="_blank" rel="noopener noreferrer">Nix</a> is an aggressive language, but once you take the plunge your entire PC configuration becomes a single repo somewhere in GitHub’s cloud.</p>
    <p>But you can also dip your toe in without using <a href="https://github.com/nix-community/home-manager" target="_blank" rel="noopener noreferrer">home-manager</a> on your personal machine.</p>
    <p><a href="https://search.nixos.org/packages" target="_blank" rel="noopener noreferrer">Nixpkgs</a> has the highest stable package coverage in the world, but that’s not the point.</p>
    <p>Use <a href="https://www.gnu.org/software/stow/" target="_blank" rel="noopener noreferrer">stow</a>, <a href="https://www.chezmoi.io/" target="_blank" rel="noopener noreferrer">chezmoi</a>, a bash script, for all I care - whatever gets you from “fresh vm” to “productive agent” in one command is the right answer.</p>
    <p>Fork <a href="https://github.com/getcompanion-ai/computer-nix" target="_blank" rel="noopener noreferrer">computer-nix</a>.</p>
    <p>It wires a simple starter home-manager config into <a href="https://agentcomputer.ai" target="_blank" rel="noopener noreferrer">agent computer</a>.</p>
    <p>You can point your claude at <a href="https://github.com/getcompanion-ai/computer-nix/blob/main/forking.md" target="_blank" rel="noopener noreferrer">this</a> and just tell it to find all your packages and dotfiles from your mac and put them into a fresh fork.</p>
    <p>Once you have the basics run <code>just go</code></p>
    <p>This boots a new VM, builds the given nix config, pulls secrets from my mac itself as well as my manager, authenticates <a href="https://github.com/anthropics/claude-code" target="_blank" rel="noopener noreferrer">claude</a> and <a href="https://github.com/openai/codex" target="_blank" rel="noopener noreferrer">codex</a> CLIs on the box, and shows me repos to clone with a simple picker.</p>
    <p>~2 minutes later I’m in a configured shell with a clean zsh prompter, all my aliases configured, my nvim config in place, and all my CLIs authenticated, ready to fire up a new codex in <a href="https://github.com/tmux/tmux" target="_blank" rel="noopener noreferrer">tmux</a>.</p>
    <p>Once you have this setup, how do you use it? Do you workspace or do you one-shot?</p>
    <p>You can organize your agents into workspaces that have multiple repos or multiple clones as well, for tasks that you can group into a single env.</p>
    <p>But I think the real beauty of this setup is that you can run one-time disposable asynchronous tasks in the cloud without having to give agent blockage a second thought.</p>
    <p>You can configure different bash scripts with their own repos and secrets and distribute your work across different machines if you like.</p>
    <p>At this point the boundary between my laptop and my cloud vms is gone.</p>
    <p>Except for a couple hardware passkeys, my computer could be snapped in half and thrown out the window and I wouldn’t lose much.</p>
    <p>I think that’s pretty cool.</p>
    <p>The point of this article was mainly to introduce people to nix, but more importantly I want to see more developers start making their own dotfiles repos and exploring different configurations.</p>
  </article>
</main>
