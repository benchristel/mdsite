import yargsParser from "yargs-parser";
import { test, expect, equals } from "@benchristel/taste";
import { DEFAULT_INPUTDIR, DEFAULT_OUTPUTDIR } from "../policy/defaults";

export type Args = BuildArgs | OrderArgs;

export type BuildArgs = {
  command: "build";
  inputDir: string;
  outputDir: string;
};

export type OrderArgs = {
  command: "order";
  inputDir: string;
};

export function parseArgs(rawArgs: Array<string>): Args {
  const yargs = yargsParser(rawArgs, { string: ["i", "o"] });
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
    };
  }
}

function order(inputDir: string): OrderArgs {
  return {
    command: "order",
    inputDir,
  };
}

function build(inputDir: string, outputDir: string): BuildArgs {
  return {
    command: "build",
    inputDir,
    outputDir,
  };
}

test("parsing arguments", {
  "given no options"() {
    const args = parseArgs([]);
    expect(args, equals, build("src", "docs"));
  },

  "given -i"() {
    const args = parseArgs(["-i", "foo"]);
    expect(args, equals, build("foo", "docs"));
  },

  "given -o"() {
    const args = parseArgs(["-o", "foo"]);
    expect(args, equals, build("src", "foo"));
  },

  "given -i with no argument"() {
    const args = parseArgs(["-i"]);
    expect(args, equals, build("src", "docs"));
  },

  "given -o with no argument"() {
    const args = parseArgs(["-o"]);
    expect(args, equals, build("src", "docs"));
  },

  "converts numeric arguments to strings"() {
    const args = parseArgs(["-i", "111", "-o", "222"]);
    expect(args, equals, build("111", "222"));
  },

  "parses arguments with = after the flag"() {
    const args = parseArgs(["-i=foo", "-o=bar"]);
    expect(args, equals, build("foo", "bar"));
  },

  "parses an order command"() {
    const args = parseArgs(["order", "-i", "foo"]);
    expect(args, equals, order("foo"));
  },
});
