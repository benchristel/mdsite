import yargsParser from "yargs-parser";
import {
  DEFAULT_INPUTDIR,
  DEFAULT_OUTPUTDIR,
  DEFAULT_TEMPLATEFILE,
} from "../policy/defaults.js";

export type Args = BuildArgs | OrderArgs;

export type BuildArgs = {
  command: "build";
  inputDir: string;
  outputDir: string;
  templateFile: string;
};

export type OrderArgs = {
  command: "order";
  inputDir: string;
};

export function parseArgs(rawArgs: Array<string>): Args {
  const yargs = yargsParser(rawArgs, { string: ["i", "o", "t"] });
  if (yargs._[0] === "order") {
    return {
      command: "order",
      inputDir: yargs.i || DEFAULT_INPUTDIR,
    };
  } else {
    return {
      command: "build",
      inputDir: yargs.i || DEFAULT_INPUTDIR,
      outputDir: yargs.o || DEFAULT_OUTPUTDIR,
      templateFile: yargs.t || DEFAULT_TEMPLATEFILE,
    };
  }
}
