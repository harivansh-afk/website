import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    // MOCKUP_BUILD publishes the mockup's js/css under its own app dir so the
    // preview can be copied into the live dist/ without touching _app
    appDir: process.env.MOCKUP_BUILD ? "_mockup2" : "_app",
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
