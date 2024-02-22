import { buildProject } from "../domain/project.js";
import { listDeep, writeDeep } from "../lib/files.js";
import { parseArgs, BuildArgs, OrderArgs } from "./args.js";
import { intoObject } from "../lib/objects.js";
import { unreachable } from "../lib/unreachable.js";
import { isOrderFile } from "../domain/order-file.js";
import { readFile } from "fs/promises";
import { defaultTemplate } from "../policy/defaults.js";

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
  const inputs = [
    readFilesFromInputDirectory(args.inputDir),
    readTemplateFile(args.templateFile),
  ] as const;
  return Promise.all(inputs)
    .then(([content, template]) => buildProject(content, template))
    .then((output) => writeDeep(args.outputDir, output));
}

async function readFilesFromInputDirectory(inputDir: string) {
  return listDeep(inputDir).catch(() => {
    throw Error(
      `ERROR: could not read from input directory '${inputDir}'.` +
        `\nhint: create the '${inputDir}' directory, or specify a different one with -i INPUTDIR`
    );
  });
}

async function readTemplateFile(templateFilePath: string) {
  return readFile(templateFilePath)
    .catch(() => {
      console.warn(
        `Warning: could not read template file '${templateFilePath}'. Using the default template.`
      );
      return defaultTemplate;
    })
    .then(String);
}

async function order(args: OrderArgs) {
  const { inputDir } = args;

  const input = await readFilesFromInputDirectory(inputDir);
  const output = buildProject(input, "");
  const orderFiles = Object.entries(output)
    .filter(([path]) => isOrderFile(path))
    .reduce(intoObject, {});
  await writeDeep(inputDir, orderFiles);
}
