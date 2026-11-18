import { createCodeRenderer } from "#lib/highlight.server.js";
import sumBaml from "./sum.baml?raw";
import sumMir from "./sum.mir?raw";
import naive from "./naive.rs?raw";
import userSum from "./user_sum.rs?raw";

export async function load() {
  const code = await createCodeRenderer();
  const block = (source, lang, name, open = false) => code(source.replace(/\n$/, ""), { lang, name, open });
  // rendered in page order: a hover definition is emitted with its first use
  return {
    sumBaml: block(sumBaml, "baml", "sum.baml"),
    sumMir: block(sumMir, "mir", "sum.mir", true),
    naive: block(naive, "rust", "naive.rs"),
    userSum: block(userSum, "rust", "user_sum.rs"),
  };
}
