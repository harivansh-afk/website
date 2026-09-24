import { createHighlighter } from "shiki";
import retry from "./retry.rs?raw";

const highlighter = createHighlighter({
  themes: ["github-light", "github-dark"],
  langs: ["rust"],
});

export async function load() {
  const syntax = await highlighter;
  return {
    retryHtml: syntax.codeToHtml(retry.trimEnd(), {
      lang: "rust",
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    }),
  };
}
