import { Project } from "../domain/project";
import { readTree, writeTree } from "../lib/files";

export function run() {
  build();
}

async function build() {
  const input = await readTree("src");
  const output = Project(input).build();
  await writeTree("docs", output);
}
