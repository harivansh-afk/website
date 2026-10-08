// what the developer screen shows: sections of rows. software and writing
// come from the same catalogs the rest of the site reads; the rest is here.
//
// a row: `key` and `value` (its two columns), `icon` (a nonicons name),
// `href` when it opens something, and `facts` (label, value pairs) plus
// `text` for the detail pane. `views` names a thought whose count replaces
// the value once views.json answers
import { software, groups } from "#lib/software.js";
import { thoughts } from "#lib/thoughts.js";
import { bareUrl } from "#lib/tui/text.js";

const NIX = "https://git.harivan.sh/harivansh-afk/nix/src/branch/main";

const fromCatalog = (group) =>
  software
    .filter((entry) => entry.group === group)
    .map((entry) => ({
      key: entry.name,
      value: entry.note,
      icon: entry.lang ?? "code",
      href: entry.href,
      text: entry.note,
      facts: [
        ["status", entry.status ?? "running"],
        ["language", entry.lang ?? "-"],
        ["source", bareUrl(entry.repo ?? entry.href)],
      ],
    }));

export const sections = [
  { id: "software", name: "software", icon: "package", note: groups.software, rows: fromCatalog("software") },
  { id: "tools", name: "tools", icon: "tools", note: groups.tools, rows: fromCatalog("tools") },
  {
    id: "experiments",
    name: "experiments",
    icon: "beaker",
    note: groups.experiments,
    rows: fromCatalog("experiments"),
  },
  {
    id: "writing",
    name: "writing",
    icon: "note",
    note: "on agents, on systems that stay correct, and a few rules i live by",
    rows: thoughts.map((t) => ({
      key: t.title,
      value: String(t.year),
      icon: "note",
      href: t.href,
      views: t.href,
      text: t.href.startsWith("http") ? "posted on x." : "on hari.cafe.",
      facts: [["year", String(t.year)]],
    })),
  },
  {
    id: "machines",
    name: "machines",
    icon: "cpu",
    note: "two computers, both declared in one nix flake",
    rows: [
      {
        key: "spark",
        value: "nvidia dgx spark, nixos",
        icon: "cpu",
        href: `${NIX}/hosts/spark`,
        text: "always on. it serves this site, my git forge and a few other services, and runs local models on its gpu.",
        facts: [
          ["arch", "aarch64"],
          ["memory", "128 gb unified"],
          ["os", "nixos, verified boot"],
        ],
      },
      {
        key: "macbook",
        value: "nix-darwin workstation",
        icon: "device-desktop",
        href: `${NIX}/hosts/macbook`,
        text: "declared end to end: apps, launchd units, homebrew casks and system defaults.",
        facts: [
          ["os", "macos, nix-darwin"],
          ["windows", "aerospace"],
          ["bar", "sketchybar"],
        ],
      },
    ],
  },
  {
    id: "setup",
    name: "setup",
    icon: "terminal",
    note: "what i type into all day",
    rows: [
      {
        key: "editor",
        value: "neovim",
        icon: "vim",
        href: `${NIX}/dots/nvim`,
        text: "cozybox for colour, nonicons for icons. this screen borrows both.",
        facts: [["theme", "cozybox.nvim"]],
      },
      {
        key: "terminal",
        value: "ghostty and mux",
        icon: "terminal",
        text: "one theme switch flips ghostty, neovim, fzf, lazygit and the wallpaper together.",
        facts: [],
      },
      {
        key: "shell",
        value: "zsh",
        icon: "shell",
        text: "prompt colours re-apply on every prompt, so a theme switch lands live.",
        facts: [],
      },
      { key: "vcs", value: "jj", icon: "git-branch", text: "jujutsu, with a patched store backend.", facts: [] },
      {
        key: "agents",
        value: "omp",
        icon: "hubot",
        text: "stock upstream, no extensions or hooks, with a profile that runs on local qwen.",
        facts: [],
      },
    ],
  },
  {
    id: "elsewhere",
    name: "elsewhere",
    icon: "globe",
    note: "where else i am",
    rows: [
      {
        key: "forgejo",
        value: "git.harivan.sh",
        icon: "git-branch",
        href: "https://git.harivan.sh/harivansh-afk",
        text: "the source of truth for my code.",
        facts: [],
      },
      {
        key: "github",
        value: "harivansh-afk",
        icon: "mark-github",
        href: "https://github.com/harivansh-afk",
        text: "mirrors and older work.",
        facts: [],
      },
      {
        key: "x",
        value: "@HarivanshRathi",
        icon: "x",
        href: "https://x.com/HarivanshRathi",
        text: "thinking out loud.",
        facts: [],
      },
      {
        key: "linkedin",
        value: "harivansh-rathi",
        icon: "person",
        href: "https://linkedin.com/in/harivansh-rathi",
        text: "the formal version.",
        facts: [],
      },
      {
        key: "hari.cafe",
        value: "the rest of the site",
        icon: "globe",
        href: "/",
        text: "prose, writing and the software canvas.",
        facts: [],
      },
    ],
  },
];

// every row of every section, for search
export const everything = sections.flatMap((section) => section.rows.map((row) => ({ ...row, section: section.name })));
