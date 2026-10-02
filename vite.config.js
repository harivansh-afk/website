import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
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
    }),
  ],
});
