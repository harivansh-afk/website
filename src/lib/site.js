// the two domains one build serves (caddy routes by host, see the nix repo's
// hosts/spark/services/website.nix): the personal site, and the developer
// screen, which is harivan.sh's root and nothing else
export const CAFE = "https://hari.cafe";
export const DEV = "https://harivan.sh";

export const isDevHost = (hostname) => hostname === "harivan.sh" || hostname === "www.harivan.sh";

// leave for the other domain the way a crt switches off: the page collapses
// to a line, then the browser navigates. a cross-site jump can't be a view
// transition, so this is half of one; the developer screen plays the other
// half (powering on) as it first paints
export function crossTo(href) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return location.assign(href);
  document.documentElement.classList.add("crt-off");
  setTimeout(() => location.assign(href), 170);
}
