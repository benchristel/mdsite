import yargsParser from "yargs-parser";
import { test, expect, equals } from "@benchristel/taste";

export type Args = BuildArgs | OrderArgs;

export type BuildArgs = {
  command: "build";
  inputDir: string | null;
  outputDir: string | null;
};

export type OrderArgs = {
  command: "order";
  inputDir: string | null;
};

export function parse(rawArgs: Array<string>): Args {
  const yargs = yargsParser(rawArgs, { string: ["i", "o"] });
  if (yargs._[0] === "order") {
    return {
      command: "order",
      inputDir: yargs.i || null,
    };
  } else {
    return {
      command: "build",
      inputDir: yargs.i || null,
      outputDir: yargs.o || null,
    };
  }
}

function order(inputDir: string | null): OrderArgs {
  return {
    command: "order",
    inputDir,
  };
}

function build(inputDir: string | null, outputDir: string | null): BuildArgs {
  return {
    command: "build",
    inputDir,
    outputDir,
  };
}

test("parsing arguments", {
  "given no options"() {
    const args = parse([]);
    expect(args, equals, build(null, null));
  },

  "given -i"() {
    const args = parse(["-i", "foo"]);
    expect(args, equals, build("foo", null));
  },

  "given -o"() {
    const args = parse(["-o", "foo"]);
    expect(args, equals, build(null, "foo"));
  },

  "given -i with no argument"() {
    const args = parse(["-i"]);
    expect(args, equals, build(null, null));
  },

  "given -o with no argument"() {
    const args = parse(["-o"]);
    expect(args, equals, build(null, null));
  },

  "converts numeric arguments to strings"() {
    const args = parse(["-i", "111", "-o", "222"]);
    expect(args, equals, build("111", "222"));
  },

  "parses arguments with = after the flag"() {
    const args = parse(["-i=foo", "-o=bar"]);
    expect(args, equals, build("foo", "bar"));
  },

  "parses an order command"() {
    const args = parse(["order", "-i", "foo"]);
    expect(args, equals, order("foo"));
  },
});