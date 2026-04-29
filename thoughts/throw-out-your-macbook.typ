#import "../_layout.typ": *

#thought(
  title: "throw out your macbook",
  description: "Throw out your macbook.",
  date: "April 2026",
)[
  #elem("p")[I want to run multiple productive coding agents.]
  #elem("p")[But any time I run more than 4 agents on my 16gb macbook, it starts crying.]
  #elem("p")[Most agent hosting providers today give you something closer to a container than a vm.]
  #elem("p")[A bare shell, some random packages, no skills, no secrets, and most of them have ref-linked filesystem mounts so your agents are already using shitty 1990s file transfer speeds.]
  #elem("p")[I tried the cheapest "real" provider I could find (#link("https://www.netcup.com/", [netcup])) and spent \~2 hours clicking around their shitty UI and setting up the VM from scratch.]
  #elem("p")[This is not acceptable.]
  #elem("p")[I (and by extension my agents) need 4 things to be productive in any environment:]
  #elem("p")[Secrets, packages, shell aliases, dotfiles.]
  #elem("p")[Without these the agent ends up working in a worse environment than I do, and whatever it produces by extension is bottlenecked.]
  #elem("p")[The stack I use for reproducible environments (or something similar like #link("https://www.gnu.org/software/stow/", [stow])) feels more like a requirement at this point than a nice-to-have.]
  #elem("p")[Even if #link("https://red.anthropic.com/2026/mythos-preview/", [mythos]) / better models arrive tomorrow, we are effectively bottlenecking the agent before we even give it a prompt.]
  #elem("p")[The fix is disposable environments, and to get there you have to join the functional gang.]
  #elem("p")[#link("https://nixos.org/", [Nix]) is an aggressive language, but once you take the plunge your entire PC configuration becomes a single repo somewhere in GitHub's cloud.]
  #elem("p")[But you can also dip your toe in without using #link("https://github.com/nix-community/home-manager", [home-manager]) on your personal machine.]
  #elem("p")[#link("https://search.nixos.org/packages", [Nixpkgs]) has the highest stable package coverage in the world, but that's not the point.]
  #elem("p")[Use #link("https://www.gnu.org/software/stow/", [stow]), #link("https://www.chezmoi.io/", [chezmoi]), a bash script, for all I care - whatever gets you from "fresh vm" to "productive agent" in one command is the right answer.]
  #elem("p")[Fork #link("https://github.com/getcompanion-ai/computer-nix", [computer-nix]).]
  #elem("p")[It wires a simple starter home-manager config into #link("https://agentcomputer.ai", [agent computer]).]
  #elem("p")[You can point your claude at #link("https://github.com/getcompanion-ai/computer-nix/blob/main/forking.md", [this]) and just tell it to find all your packages and dotfiles from your mac and put them into a fresh fork.]
  #elem("p")[Once you have the basics run #code[just go]]
  #elem("p")[This boots a new VM, builds the given nix config, pulls secrets from my mac itself as well as my manager, authenticates #link("https://github.com/anthropics/claude-code", [claude]) and #link("https://github.com/openai/codex", [codex]) CLIs on the box, and shows me repos to clone with a simple picker.]
  #elem("p")[\~2 minutes later I'm in a configured shell with a clean zsh prompter, all my aliases configured, my nvim config in place, and all my CLIs authenticated, ready to fire up a new codex in #link("https://github.com/tmux/tmux", [tmux]).]
  #elem("p")[Once you have this setup, how do you use it? Do you workspace or do you one-shot?]
  #elem("p")[You can organize your agents into workspaces that have multiple repos or multiple clones as well, for tasks that you can group into a single env.]
  #elem("p")[But I think the real beauty of this setup is that you can run one-time disposable asynchronous tasks in the cloud without having to give agent blockage a second thought.]
  #elem("p")[You can configure different bash scripts with their own repos and secrets and distribute your work across different machines if you like.]
  #elem("p")[At this point the boundary between my laptop and my cloud vms is gone.]
  #elem("p")[Except for a couple hardware passkeys, my computer could be snapped in half and thrown out the window and I wouldn't lose much.]
  #elem("p")[I think that's pretty cool.]
  #elem("p")[The point of this article was mainly to introduce people to nix, but more importantly I want to see more developers start making their own dotfiles repos and exploring different configurations.]
]
