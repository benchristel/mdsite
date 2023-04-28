import { buildProject } from "../domain/project";
import { listDeep, writeDeep } from "../lib/files";
import { parseArgs, BuildArgs, OrderArgs } from "./args";
import { intoObject } from "../lib/objects";
import { unreachable } from "../lib/unreachable";
import { isOrderFile } from "../domain/order-file";
import { readFile } from "fs/promises";
import { defaultTemplate } from "../policy/defaults";

export function run(argv: Array<string>): Promise<void> {
  const args = parseArgs(argv);
  switch (args.command) {
    case "build":
      return build(args);
    case "order":
      return order(args);
    default:
      throw unreachable("unexpected command", args);
  }
}

async function build(args: BuildArgs) {
  const { inputDir, outputDir, templateFile } = args;

  const [input, template] = await Promise.all([
    listDeep(inputDir).catch(() => {
      throw Error(
        `ERROR: could not read from input directory '${inputDir}'.` +
          `\nhint: create the '${inputDir}' directory, or specify a different one with -i INPUTDIR`
      );
    }),
    readFile(templateFile).catch(() => {
      console.warn(
        `Warning: could not read template file '${templateFile}'. Using the default template.`
      );
      return defaultTemplate;
    }),
  ]);
  const output = buildProject(input, template.toString());
  await writeDeep(outputDir, output);
}

async function order(args: OrderArgs) {
  const { inputDir } = args;

  const input = await listDeep(inputDir);
  const output = buildProject(input, "");
  const orderFiles = Object.entries(output)
    .filter(([path]) => isOrderFile(path))
    .reduce(intoObject, {});
  await writeDeep(inputDir, orderFiles);
}
