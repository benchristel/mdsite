import yargsParser from "yargs-parser";
import { test, expect, equals } from "@benchristel/taste";
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
function order(inputDir) {
    return {
        command: "order",
        inputDir,
    };
}
function build(inputDir, outputDir, templateFile) {
    return {
        command: "build",
        inputDir,
        outputDir,
        templateFile,
    };
}
test("parsing arguments", {
    "given no options"() {
        const args = parseArgs([]);
        expect(args, equals, build("src", "docs", "template.html"));
    },
    "given -i"() {
        const args = parseArgs(["-i", "foo"]);
        expect(args, equals, build("foo", "docs", "template.html"));
    },
    "given -o"() {
        const args = parseArgs(["-o", "foo"]);
        expect(args, equals, build("src", "foo", "template.html"));
    },
    "given -t"() {
        const args = parseArgs(["-t", "foo"]);
        expect(args, equals, build("src", "docs", "foo"));
    },
    "given -i with no argument"() {
        const args = parseArgs(["-i"]);
        expect(args, equals, build("src", "docs", "template.html"));
    },
    "given -o with no argument"() {
        const args = parseArgs(["-o"]);
        expect(args, equals, build("src", "docs", "template.html"));
    },
    "converts numeric arguments to strings"() {
        const args = parseArgs(["-i", "111", "-o", "222"]);
        expect(args, equals, build("111", "222", "template.html"));
    },
    "parses arguments with = after the flag"() {
        const args = parseArgs(["-i=foo", "-o=bar"]);
        expect(args, equals, build("foo", "bar", "template.html"));
    },
    "parses an order command"() {
        const args = parseArgs(["order", "-i", "foo"]);
        expect(args, equals, order("foo"));
    },
});
