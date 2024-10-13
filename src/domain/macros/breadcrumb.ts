import yargsParser from "yargs-parser";
import { htmlBreadcrumb } from "../breadcrumbs.js";
import { Macro } from "./types.js";

export function breadcrumb(_: string, args: string[]): Macro {
  return (context) =>
    htmlBreadcrumb(context.outputPath, context.globalInfo, parseArgs(args));
}

type BreadcrumbArgs = {
  omitNavWrapper: boolean;
};

function parseArgs(rawArgs: string[]): BreadcrumbArgs {
  const { nav = true } = yargsParser(rawArgs, { boolean: ["no-nav"] });
  return {
    omitNavWrapper: !nav,
  };
}
