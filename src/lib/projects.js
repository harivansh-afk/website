// the project list, shared by the row view (Projects.svelte) and the grid
// mockup. width/height are each file's intrinsic pixels (ffprobe); they
// reserve the media box before anything loads. bg is the solid the grid
// tile paints behind media that isn't 16:9, picked from each shot's own
// palette (or matching its edge color, so the frame is seamless)
export const projects = [
  {
    name: "mixbridge",
    href: "https://mixbridge.app/",
    media: "mixbridge.mp4",
    width: 590,
    height: 1280,
    phone: true, // raw iphone screen recording: media carries the screen's rounded corners
    bg: "#1b2ed1", // the app's blue, a step brighter than the screen
    desc: "a beautiful listening experience on iOS that mixes music on the go",
  },
  {
    name: "einstein ai",
    href: "https://www.cnet.com/tech/services-and-software/companion-einstein-ai-tool/",
    media: "einstein.webp",
    width: 640,
    height: 400,
    bg: "#f3cf49", // the shot's own yellow: seamless
    desc: "ai agent that does your canvas assignments autonomously",
    note: "cease and desisted",
  },
  {
    name: "mux",
    href: "https://git.harivan.sh/harivansh-afk/mux",
    media: "mux.mp4",
    width: 1280,
    height: 830,
    bg: "#b8b0a2", // warm sand from the terminal's text, behind a near-black window
    desc: "a stateless, host-agnostic, macos-native terminal multiplexing client for ghostty",
  },
  {
    name: "pierrejo",
    href: "https://git.harivan.sh/harivansh-afk/pierrejo",
    media: "pierrejo.mp4",
    width: 1280,
    height: 894,
    bg: "#1f4652", // dark teal behind the pale diff view
    desc: "beautiful and instantaneous diff viewing for forgejo",
  },
  {
    name: "agentcomputer",
    href: "https://github.com/AgentComputerAI",
    media: "agentcomputer.mp4",
    width: 1280,
    height: 782,
    bg: "#c8cbd0", // cool light gray behind the black ascii site
    desc: "isolated cloud computers for ai agents",
    note: "no longer maintained",
  },
  {
    name: "nap",
    href: "https://git.harivan.sh/harivansh-afk/nap",
    media: "nap.mp4",
    width: 360,
    height: 640,
    bg: "#2d5a3c", // deep green against the beige carpet
    desc: "Not Airplay™",
    desc2: "turn a linux-owned monitor into an extended display for your mac",
  },
  {
    name: "deskctl",
    href: "https://deskctl.dev",
    media: "deskctl.mp4",
    width: 640,
    height: 336,
    bg: "#b7472a", // rust behind the two light windows
    desc: "non-interactive x11 desktop control for ai agents",
    note: "no longer maintained",
  },
  {
    name: "betterNAS",
    href: "https://betternas.com",
    media: "betternas.webp",
    width: 640,
    height: 326,
    bg: "#fefefe", // the shot's own white: seamless
    desc: "macos native filesystem admin over http",
    note: "no longer maintained",
  },
];
