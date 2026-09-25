import { marked, Renderer } from "marked";
import { createCodeRenderer } from "$lib/highlight.server.js";
import request from "./request.rs?raw";
import draft from "../../../../sans-io-draft.md?raw";

function dedent(text) {
  const lines = text.trimEnd().split("\n");
  const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length));
  return lines.map((line) => line.slice(indent)).join("\n");
}

export async function load() {
  const tokens = marked.lexer(draft);
  const heading = tokens.shift();
  if (heading?.type !== "heading" || heading.depth !== 1) {
    throw new Error("The Sans I/O draft must start with its title as an H1.");
  }

  const regions = new Map(
    [...request.matchAll(/^ *\/\/ #region (\w+)\n([\s\S]*?)^ *\/\/ #endregion/gm)]
      .map(([, name, source]) => [name, dedent(source)]),
  );
  const code = await createCodeRenderer();
  const renderer = new Renderer();
  renderer.code = ({ text, lang }) => {
    const region = /^rust region=(\w+)$/.exec(lang || "")?.[1];
    if (region) {
      // The readable Markdown and the compiled Rust example must agree.
      if (regions.get(region) !== dedent(text)) {
        throw new Error(`Sans I/O code block differs from request.rs: ${region}`);
      }
      return code(request, { region });
    }
    return code(text, { lang: lang || "text" });
  };

  // Figures are trusted, repo-owned HTML, as in the other Markdown article.
  return { title: heading.text, html: marked.parser(tokens, { renderer }) };
}
