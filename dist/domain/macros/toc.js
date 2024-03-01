import yargsParser from "yargs-parser";
import { htmlToc } from "../toc.js";
export function toc(_, rawArgs) {
    const { root, includeLatent } = parseTocArgs(rawArgs);
    return (context) => htmlToc(context.globalInfo.orderedEntries, context.outputPath, {
        root,
        includeLatent,
    });
}
export function parseTocArgs(raw) {
    const args = yargsParser(raw, { boolean: ["include-latent"] });
    const root = parseRootArg(args._[0]);
    return { root, includeLatent: args.includeLatent };
}
function parseRootArg(raw) {
    if (raw === undefined) {
        return raw;
    }
    else {
        return String(raw);
    }
}
