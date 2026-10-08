// nonicons, the icon font my editor uses (nonicons.nvim), at the codepoints
// its mapping.lua gives them. static/fonts/nonicons.woff2 is subset to
// exactly these, so a new icon needs its codepoint here and a re-subset:
//   pyftsubset nonicons.ttf --unicodes=<these> --flavor=woff2
const CODEPOINTS = {
  package: 61846,
  tools: 61917,
  beaker: 61707,
  note: 61842,
  cpu: 61740,
  terminal: 61911,
  globe: 61788,
  rust: 61881,
  go: 61789,
  swift: 61906,
  typescript: 61923,
  javascript: 61810,
  python: 61863,
  lua: 61826,
  svelte: 61992,
  shell: 61911,
  code: 61734,
  "mark-github": 61828,
  mention: 61831,
  briefcase: 61714,
  server: 61886,
  home: 61796,
  tmux: 61915,
  agent: 62080,
  vim: 61932,
  "git-branch": 61783,
  "device-desktop": 61750,
  "link-external": 61819,
};

export const icon = (name) => String.fromCodePoint(CODEPOINTS[name] ?? CODEPOINTS.code);
