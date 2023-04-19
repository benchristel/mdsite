import { basename } from "path";
import { buildProject } from "../domain/project";
import { listDeep, writeDeep } from "../lib/files";
import { parse, BuildArgs, OrderArgs } from "./args";
import { intoObject } from "../lib/objects";
import { unreachable } from "../lib/unreachable";

export function run() {
  const args = parse(process.argv.slice(2));
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
  const inputDir = args.inputDir ?? "src";
  const outputDir = args.outputDir ?? "docs";

  const input = await listDeep(inputDir);
  const output = buildProject(input);
  await writeDeep(outputDir, output);
}

async function order(args: OrderArgs) {
  const inputDir = args.inputDir ?? "src";

  const input = await listDeep(inputDir);
  const output = buildProject(input);
  const orderFiles = Object.entries(output)
    .filter(([path]) => {
      return basename(path) === "order.txt";
    })
    .reduce(intoObject, {});
  await writeDeep(inputDir, orderFiles);
}
