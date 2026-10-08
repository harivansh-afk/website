import { createCodeRenderer } from "#lib/highlight.server.js";
import request from "./request.rs?raw";

export async function load() {
  const code = await createCodeRenderer();
  // The complete example opens in the playground with the same source.
  const playground = new URL("https://play.rust-lang.org/");
  playground.search = new URLSearchParams({
    version: "stable",
    mode: "debug",
    edition: "2021",
    code: request,
  }).toString();

  // Each block is one `// #region` of request.rs, the file the tests run.
  return {
    handlers: code(request, { region: "handlers", name: "request.rs" }),
    orderings: code(request, { region: "orderings", name: "request.rs" }),
    duplicate: code(request, { region: "duplicate", name: "request.rs" }),
    playground: playground.href,
  };
}
