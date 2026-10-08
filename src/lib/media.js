// cache busters for static/ media, which the CDN caches immutably: bump
// VIDEO_V when the clips in static/previews/ are regenerated and POSTER_V when
// the software posters in static/software/ are
export const VIDEO_V = "18";
export const POSTER_V = "1";

export const clipSrc = (name) => `/previews/${name}.mp4?v=${VIDEO_V}`;
