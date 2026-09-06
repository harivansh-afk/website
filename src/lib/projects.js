// the project list, shared by the row view (Projects.svelte) and the grid
// mockup. width/height are each file's intrinsic pixels (ffprobe); they
// reserve the media box before anything loads
export const projects = [
  {
    name: "mixbridge",
    href: "https://mixbridge.app/",
    media: "mixbridge.mp4",
    width: 590,
    height: 1280,
    phone: true, // raw iphone screen recording: media carries the screen's rounded corners
    desc: "a beautiful listening experience on iOS that mixes music on the go",
  },
  {
    name: "einstein ai",
    href: "https://www.cnet.com/tech/services-and-software/companion-einstein-ai-tool/",
    media: "einstein.webp",
    width: 640,
    height: 400,
    desc: "ai agent that does your canvas assignments autonomously",
    note: "cease and desisted",
  },
  {
    name: "mux",
    href: "https://git.harivan.sh/harivansh-afk/mux",
    media: "mux.mp4",
    width: 1280,
    height: 830,
    desc: "a stateless, host-agnostic, macos-native terminal multiplexing client for ghostty",
  },
  {
    name: "pierrejo",
    href: "https://git.harivan.sh/harivansh-afk/pierrejo",
    media: "pierrejo.mp4",
    width: 1280,
    height: 894,
    desc: "beautiful and instantaneous diff viewing for forgejo",
  },
  {
    name: "agentcomputer",
    href: "https://github.com/AgentComputerAI",
    media: "agentcomputer.mp4",
    width: 1280,
    height: 782,
    desc: "isolated cloud computers for ai agents",
    note: "no longer maintained",
  },
  {
    name: "nap",
    href: "https://git.harivan.sh/harivansh-afk/nap",
    media: "nap.mp4",
    width: 360,
    height: 640,
    desc: "Not Airplay™",
    desc2: "turn a linux-owned monitor into an extended display for your mac",
  },
  {
    name: "deskctl",
    href: "https://deskctl.dev",
    media: "deskctl.mp4",
    width: 640,
    height: 336,
    desc: "non-interactive x11 desktop control for ai agents",
    note: "no longer maintained",
  },
  {
    name: "betterNAS",
    href: "https://betternas.com",
    media: "betternas.webp",
    width: 640,
    height: 400,
    desc: "macos native filesystem admin over http",
    note: "no longer maintained",
  },
];

// "mixbridge.app", "git.harivan.sh" ...: the destination, shown as metadata
export const host = (href) => new URL(href).hostname.replace(/^www\./, "");
export const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
