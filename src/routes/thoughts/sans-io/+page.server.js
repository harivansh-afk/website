import { createHighlighter } from "shiki";
import { marked, Renderer } from "marked";
import { createHash } from "node:crypto";
import draft from "../../../../sans-io-draft.md?raw";
import boundary from "../../../../static/diagrams/message-boundary.svg?raw";
import inputs from "../../../../static/diagrams/controlled-inputs.svg?raw";

const highlighter = createHighlighter({
  themes: ["github-light", "github-dark"],
  langs: ["rust"],
});

const diagrams = new Map([
  ["/diagrams/message-boundary.svg", { source: boundary, width: 640, height: 300 }],
  ["/diagrams/controlled-inputs.svg", { source: inputs, width: 640, height: 320 }],
]);

const escapeAttribute = (value) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

export async function load() {
  const tokens = marked.lexer(draft);
  const heading = tokens.shift();
  if (heading?.type !== "heading" || heading.depth !== 1) {
    throw new Error("The Sans I/O draft must start with its title as an H1.");
  }

  const syntax = await highlighter;
  const renderer = new Renderer();
  renderer.code = ({ text, lang }) => `<div class="code-example">${
    syntax.codeToHtml(text, {
      lang: lang || "text",
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    })
  }</div>`;

  renderer.image = ({ href, text, title }) => {
    let src = href.startsWith("static/") ? `/${href.slice(7)}` : href;
    const diagram = diagrams.get(src);
    if (diagram) {
      src += `?rev=${createHash("sha256").update(diagram.source).digest("hex").slice(0, 12)}`;
    }
    const alt = escapeAttribute(text);
    const dimensions = diagram ? ` width="${diagram.width}" height="${diagram.height}"` : "";
    const imageTitle = title ? ` title="${escapeAttribute(title)}"` : "";
    return `<img src="${escapeAttribute(src)}" alt="${alt}"${dimensions}${imageTitle} />`;
  };

  renderer.paragraph = function ({ tokens }) {
    if (tokens.length === 1 && tokens[0].type === "image") {
      const alt = escapeAttribute(tokens[0].text);
      return `<figure><div class="diagram-scroll" tabindex="0" role="region" aria-label="${alt}">${this.parser.parseInline(tokens)}</div></figure>\n`;
    }
    return `<p>${this.parser.parseInline(tokens)}</p>\n`;
  };

  const blocks = [];
  let prose = [];
  const flush = () => {
    if (prose.some((token) => token.type !== "space")) {
      blocks.push({ type: "html", html: marked.parser(prose, { renderer }) });
    }
    prose = [];
  };

  for (const token of tokens) {
    const marker = token.type === "html"
      ? token.raw.trim().match(/^<!--\s*network-timing(?:\s*:\s*([\s\S]*?))?\s*-->$/)
      : null;
    if (marker) {
      flush();
      blocks.push({ type: "network-timing", caption: marker[1]?.trim() || undefined });
    } else if (!(token.type === "html" && token.raw.trim().startsWith("<!--"))) {
      prose.push(token);
    }
  }
  flush();

  // Prose and code are trusted, repo-owned Markdown. Only this marker mounts a component.
  return { title: heading.text, blocks };
}
