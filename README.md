# website

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

The autonomy radius article is edited in `autonomy-radius-draft.md`. Its route
renders that file directly, including the four figures in `static/diagrams/`.
Run `bun run dev` for a live preview while editing, or `./build.sh` to prerender it.

`sans-io-draft.md` is a manual working copy for the Sans I/O article.
Copy prose into `src/routes/thoughts/sans-io/+page.svelte` and code into the
adjacent `retry.rs` manually, preserving intentional paragraph breaks.
The page does not import or render this Markdown file.
