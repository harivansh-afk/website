import { isDevHost } from "#lib/site.js";

// on harivan.sh the root is the developer screen: caddy serves its prerendered
// html at /, and this makes the client router hydrate it as that route
export function reroute({ url }) {
  if (isDevHost(url.hostname) && url.pathname === "/") return "/developer/";
}
