import yargsParser from "yargs-parser";
import { test, expect, equals } from "@benchristel/taste";

export type Args = {
  inputDir: string | null;
  outputDir: string | null;
};

export function parse(rawArgs: Array<string>): Args {
  const yargs = yargsParser(rawArgs, { string: ["i", "o"] });
  return {
    inputDir: yargs.i || null,
    outputDir: yargs.o || null,
  };
}

test("parsing arguments", {
  "given no options"() {
    const args = parse([]);
    expect(args, equals, { inputDir: null, outputDir: null });
  },

  "given -i"() {
    const args = parse(["-i", "foo"]);
    expect(args, equals, { inputDir: "foo", outputDir: null });
  },

  "given -o"() {
    const args = parse(["-o", "foo"]);
    expect(args, equals, { inputDir: null, outputDir: "foo" });
  },

  "given -i with no argument"() {
    const args = parse(["-i"]);
    expect(args, equals, { inputDir: null, outputDir: null });
  },

  "given -o with no argument"() {
    const args = parse(["-o"]);
    expect(args, equals, { inputDir: null, outputDir: null });
  },

  "converts numeric arguments to strings"() {
    const args = parse(["-i", "111", "-o", "222"]);
    expect(args, equals, { inputDir: "111", outputDir: "222" });
  },

  "parses arguments with = after the flag"() {
    const args = parse(["-i=foo", "-o=bar"]);
    expect(args, equals, { inputDir: "foo", outputDir: "bar" });
  },
});
