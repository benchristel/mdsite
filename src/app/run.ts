import { buildProject } from "../domain/project";
import { listDeep, writeDeep } from "../lib/files";

export function run() {
  build();
}

async function build() {
  const input = await listDeep("src");
  const output = buildProject(input);
  await writeDeep("docs", output);
}
