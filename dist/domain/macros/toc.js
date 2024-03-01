import yargsParser from "yargs-parser";
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
