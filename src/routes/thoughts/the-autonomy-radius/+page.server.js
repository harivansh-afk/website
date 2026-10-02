import { createCodeRenderer } from "#lib/highlight.server.js";

export async function load() {
  const code = await createCodeRenderer();
  return {
    unwrap: code("let port = u16::try_from(cfg.port).unwrap_or_default();"),
    instrument: code("let future = receive_body().instrument(span);\nfuture.await?;"),
  };
}
