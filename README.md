# website

Personal site, served as harivan.sh. SvelteKit, fully prerendered.

```bash
bun install
bun run dev   # live preview
./build.sh    # prerender into dist/ and regenerate the commit heatmap
```

The autonomy radius article is edited in `autonomy-radius-draft.md`. Its route
renders that file directly, including the four figures in `static/diagrams/`.

The Sans I/O article is edited in `sans-io-draft.md`, which its route also
renders directly. Each `rust region=<name>` fence must match the same region in
`src/routes/thoughts/sans-io/request.rs`, or the build fails.
