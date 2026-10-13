import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({
        // build.sh builds into .build/ and swaps it in for dist/
        pages: process.env.SITE_OUT ?? "dist",
        assets: process.env.SITE_OUT ?? "dist",
        fallback: undefined,
        precompress: false,
        strict: true,
      }),
      prerender: {
        entries: ["*", "/404"],
      },
      // the global stylesheet goes inline in every page, so first paint
      // waits on no request but the html
      inlineStyleThreshold: 40000,
      paths: {
        // 404.html is served for arbitrary missing paths; asset urls must be absolute
        relative: false,
      },
    }),
  ],
});
