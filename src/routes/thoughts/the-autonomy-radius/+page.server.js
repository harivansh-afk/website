import { marked } from 'marked';
import draft from '../../../../autonomy-radius-draft.md?raw';

export function load() {
  const tokens = marked.lexer(draft);
  const heading = tokens.shift();
  if (heading?.type !== 'heading' || heading.depth !== 1) {
    throw new Error('The autonomy radius draft must start with its title as an H1.');
  }

  // This is trusted, repo-owned prose. Its figures intentionally contain HTML.
  return { title: heading.text, html: marked.parser(tokens) };
}
