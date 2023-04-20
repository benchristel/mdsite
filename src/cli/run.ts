import { buildProject } from "../domain/project";
import { listDeep, writeDeep } from "../lib/files";
import { parseArgs, BuildArgs, OrderArgs } from "./args";
import { intoObject } from "../lib/objects";
import { unreachable } from "../lib/unreachable";
import { isOrderFile } from "../domain/entry-ordering";

export function run() {
  const args = parseArgs(process.argv.slice(2));
  switch (args.command) {
    case "build":
      build(args);
      break;
    case "order":
      order(args);
      break;
    default:
      throw unreachable("unexpected command", args);
  }
}

async function build(args: BuildArgs) {
  const { inputDir, outputDir } = args;

  const input = await listDeep(inputDir);
  const output = buildProject(input);
  await writeDeep(outputDir, output);
}

async function order(args: OrderArgs) {
  const { inputDir } = args;

  const input = await listDeep(inputDir);
  const output = buildProject(input);
  const orderFiles = Object.entries(output)
    .filter(([path]) => isOrderFile(path))
    .reduce(intoObject, {});
  await writeDeep(inputDir, orderFiles);
}
