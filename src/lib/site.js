// the two domains one build serves (caddy routes by host, see the nix repo's
// hosts/spark/services/website.nix): the personal site, and the developer
// screen, which is harivan.sh's root and nothing else
export const CAFE = "https://hari.cafe";
export const DEV = "https://harivan.sh";

export const isDevHost = (hostname) => hostname === "harivan.sh" || hostname === "www.harivan.sh";
