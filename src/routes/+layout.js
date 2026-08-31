// fully static site: prerender everything. csr is on so navigation is
// client-side (hover preloads the next page, clicks swap the dom in place)
export const prerender = true;
export const csr = true;
export const trailingSlash = "always";
