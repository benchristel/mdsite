import yargsParser from "yargs-parser";
import { htmlBreadcrumb } from "../breadcrumbs.js";
export function breadcrumb(_, args) {
    return (context) => htmlBreadcrumb(context.outputPath, context.globalInfo, parseArgs(args));
}
function parseArgs(rawArgs) {
    const { nav = true } = yargsParser(rawArgs, { boolean: ["no-nav"] });
    return {
        omitNavWrapper: !nav,
    };
}
