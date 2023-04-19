import { buildProject } from "../domain/project";
import { listDeep, writeDeep } from "../lib/files";
import { parse, Args } from "./args";

export function run() {
  const args = parse(process.argv.slice(2));
  build(args);
}

async function build(args: Args) {
  const inputDir = args.inputDir ?? "src";
  const outputDir = args.outputDir ?? "docs";

  const input = await listDeep(inputDir);
  const output = buildProject(input);
  await writeDeep(outputDir, output);
}
