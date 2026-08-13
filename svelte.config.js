import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter({
      pages: "dist",
      assets: "dist",
      fallback: undefined,
      precompress: false,
      strict: true,
    }),
    prerender: {
      entries: ["*", "/404"],
    },
    paths: {
      // 404.html is served for arbitrary missing paths; asset urls must be absolute
      relative: false,
    },
  },
};
