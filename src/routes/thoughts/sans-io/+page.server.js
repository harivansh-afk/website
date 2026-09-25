import { createCodeRenderer } from "$lib/highlight.server.js";
import request from "./request.rs?raw";

export async function load() {
  const code = await createCodeRenderer();
  return {
    tickHtml: code(request, { region: "tick" }),
  };
}
