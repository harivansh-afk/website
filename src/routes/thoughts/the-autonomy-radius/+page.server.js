import { marked, Renderer } from 'marked';
import { createHighlighter } from 'shiki';
import draft from '../../../../autonomy-radius-draft.md?raw';

const highlighter = createHighlighter({
  themes: ['github-light', 'github-dark'],
  langs: ['rust'],
});

export async function load() {
  const tokens = marked.lexer(draft);
  const heading = tokens.shift();
  if (heading?.type !== 'heading' || heading.depth !== 1) {
    throw new Error('The autonomy radius draft must start with its title as an H1.');
  }

  const syntax = await highlighter;
  const renderer = new Renderer();
  renderer.code = ({ text, lang }) => syntax.codeToHtml(text, {
    lang: lang || 'text',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });

  // This is trusted, repo-owned prose. Its figures intentionally contain HTML.
  return { title: heading.text, html: marked.parser(tokens, { renderer }) };
}
