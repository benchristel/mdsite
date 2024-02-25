import yargsParser from "yargs-parser";
import { DEFAULT_INPUTDIR, DEFAULT_OUTPUTDIR, DEFAULT_TEMPLATEFILE, } from "../policy/defaults.js";
export function parseArgs(rawArgs) {
    const yargs = yargsParser(rawArgs, { string: ["i", "o", "t"] });
    if (yargs._[0] === "order") {
        return {
            command: "order",
            inputDir: yargs.i || DEFAULT_INPUTDIR,
        };
    }
    else {
        return {
            command: "build",
            inputDir: yargs.i || DEFAULT_INPUTDIR,
            outputDir: yargs.o || DEFAULT_OUTPUTDIR,
            templateFile: yargs.t || DEFAULT_TEMPLATEFILE,
        };
    }
}
