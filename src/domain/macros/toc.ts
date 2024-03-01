import yargsParser from "yargs-parser";
import { TocOptions, htmlToc } from "../toc.js";
import { Macro } from "./types.js";

export function toc(_: string, rawArgs: string[]): Macro {
  const { root, includeLatent } = parseTocArgs(rawArgs);
  return (context) =>
    htmlToc(context.globalInfo.orderedEntries, context.outputPath, {
      root,
      includeLatent,
    });
}

export function parseTocArgs(raw: string[]): TocOptions {
  const args = yargsParser(raw, { boolean: ["include-latent"] });
  const root: string | undefined = parseRootArg(args._[0]);
  return { root, includeLatent: args.includeLatent };
}

function parseRootArg(raw: string | number | undefined) {
  if (raw === undefined) {
    return raw;
  } else {
    return String(raw);
  }
}
