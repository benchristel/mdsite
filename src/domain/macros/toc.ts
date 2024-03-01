import yargsParser from "yargs-parser";
import { TocOptions } from "../toc";

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
