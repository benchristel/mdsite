import { test, expect, equals, not } from "@benchristel/taste";
import { first, isEmpty } from "../lib/indexables";
import {
  ProjectGlobalInfo,
  dummyProjectGlobalInfo,
} from "./project-global-info";
import Logger, { mockLogger } from "../lib/logger";
import { title } from "./title";
import { htmlToc } from "./toc";
import { dirname } from "path";
import { homeLink, nextLink, prevLink, upLink } from "./links";

const bareArg = String.raw`[a-zA-Z0-9\/\-_\.]+`;
const quotedArg = String.raw`"(?:\\.|[^"\\])*"`;
const arg = String.raw`(?:${bareArg}|${quotedArg})`;
export const macros = new RegExp(String.raw`{{\s*[a-z]+(\s+${arg})*\s*}}`, "g");

const findAllMacros = (s: string) => [...s.matchAll(macros)].map(first);

const isAMacro = (s: string) => s.match(macros)?.[0]?.length === s.length;

test("extracting macros", {
  "given empty string"() {
    expect(findAllMacros(""), isEmpty);
  },

  "given a string containing no macros"() {
    expect(findAllMacros("a b c"), isEmpty);
  },

  "does not match an empty pair of double-curlies"() {
    expect("{{}}", not(isAMacro));
  },

  "matches {{toc}}"() {
    expect("{{toc}}", isAMacro);
  },

  "matches any ol' macro name"() {
    expect("{{foobar}}", isAMacro);
  },

  "matches macros embedded in other content"() {
    expect(findAllMacros("{{a}} b {{c}}"), equals, ["{{a}}", "{{c}}"]);
  },

  "matches a macro with whitespace inside the double-curlies"() {
    expect("{{\n  blah\n }}", isAMacro);
  },

  "matches a macro with an argument"() {
    expect("{{foo bar}}", isAMacro);
  },

  "accepts multiple arguments"() {
    expect("{{foo bar baz}}", isAMacro);
  },

  "accepts extra whitespace between arguments"() {
    expect("{{foo\n bar\n baz}}", isAMacro);
  },

  "accepts slashes, dashes, underscores, and periods in bare arguments"() {
    expect("{{foo -a /tmp/bar_baz.txt}}", isAMacro);
  },

  "accepts capital letters and numbers in bare arguments"() {
    expect("{{foo A 9}}", isAMacro);
  },

  "does not accept other special characters in bare arguments"() {
    expect("{{foo &}}", not(isAMacro));
  },

  "accepts special characters in quoted arguments"() {
    expect(String.raw`{{foo "&"}}`, isAMacro);
  },

  "accepts multi-character quoted arguments"() {
    expect(String.raw`{{foo "abc"}}`, isAMacro);
  },

  "accepts empty quoted arguments"() {
    expect(String.raw`{{foo ""}}`, isAMacro);
  },

  "does not accept unpaired quotes"() {
    expect(String.raw`{{foo "}}`, not(isAMacro));
  },

  "accepts escaped quotes inside quotes"() {
    expect(String.raw`{{foo "\""}}`, isAMacro);
  },

  "accepts escaped backslashes inside quotes"() {
    expect(String.raw`{{foo "\\"}}`, isAMacro);
  },

  "accepts an escaped backslash followed by an escaped quote"() {
    expect(String.raw`{{foo "\\\""}}`, isAMacro);
  },

  "does not accept an unterminated quoted arg with an escaped quote"() {
    expect(String.raw`{{foo "\\\"}}`, not(isAMacro));
  },
});

function getTokens(s: string): Array<string> {
  return [...s.matchAll(new RegExp(arg, "g"))]
    .map(first)
    .filter(defined)
    .map(unquote);
}

function defined<T>(s: T | undefined): s is T {
  return s !== undefined;
}

function unquote(s: string) {
  if (s[0] === '"') {
    return JSON.parse(s);
  } else {
    return s;
  }
}

test("tokenizing macros", {
  "extracts the macro name"() {
    expect(getTokens("{{foo}}"), equals, ["foo"]);
  },

  "extracts bare arguments"() {
    expect(getTokens("{{foo bar baz}}"), equals, ["foo", "bar", "baz"]);
  },

  "extracts bare arguments with symbols"() {
    expect(getTokens("{{foo -a /tmp/Bar_baz.txt 9}}"), equals, [
      "foo",
      "-a",
      "/tmp/Bar_baz.txt",
      "9",
    ]);
  },

  "extracts and interprets quoted arguments"() {
    expect(getTokens(String.raw`{{foo "\"hello\""}}`), equals, [
      "foo",
      String.raw`"hello"`,
    ]);
  },
});

type EvaluationContext = {
  outputPath: string;
  content: string;
  globalInfo: ProjectGlobalInfo;
};

export function evaluate(
  context: EvaluationContext
): (macro: string) => string {
  return (macro) => {
    const tokens = getTokens(macro);
    const macroName = tokens[0];
    switch (macroName) {
      case "content":
        return context.content.replace(macros, evaluate(context));
      case "title":
        return title(context.outputPath, context.content);
      case "toc":
        return htmlToc(context.globalInfo, dirname(context.outputPath));
      case "next":
        return nextLink(context.globalInfo, context.outputPath);
      case "prev":
        return prevLink(context.globalInfo, context.outputPath);
      case "up":
        return upLink(context.outputPath);
      case "home":
        return homeLink(context.outputPath);
      case "macro":
        return macro.replace(/{{\s*macro\s+(.*)/, "{{$1");
      default:
        Logger.warn(
          `warning: encountered unknown macro '${macroName}' while compiling ${context.outputPath}`
        );
        return macro;
    }
  };
}

const dummyContext = {
  outputPath: "",
  content: "",
  globalInfo: dummyProjectGlobalInfo,
};

test("evaluating macros", {
  "logs a warning if the macro is unrecognized"() {
    const { warnings } = mockLogger(() => {
      const context = { ...dummyContext, outputPath: "/my/file.html" };
      evaluate(context)("{{foo}}");
    });

    expect(warnings, equals, [
      [
        "warning: encountered unknown macro 'foo' while compiling /my/file.html",
      ],
    ]);
  },

  "evalutes {{content}}"() {
    mockLogger(() => {
      const context = { ...dummyContext, content: "wow" };
      const result = evaluate(context)("{{content}}");
      expect(result, equals, "wow");
    });
  },

  "gets {{title}} from an <h1> element"() {
    mockLogger(() => {
      const context = { ...dummyContext, content: "<h1>The Title</h1>" };
      const result = evaluate(context)("{{title}}");
      expect(result, equals, "The Title");
    });
  },

  "defaults {{title}} to the filename"() {
    mockLogger(() => {
      const context = { ...dummyContext, outputPath: "/foo/bar.html" };
      const result = evaluate(context)("{{title}}");
      expect(result, equals, "bar.html");
    });
  },

  "evaluates {{title}} in the content"() {
    mockLogger(() => {
      const context = {
        ...dummyContext,
        content: "hello {{title}}",
        outputPath: "/foo/bar.html",
      };
      const result = evaluate(context)("{{content}}");
      expect(result, equals, "hello bar.html");
    });
  },

  "evaluates {{macro}}"() {
    mockLogger(() => {
      const context = {
        ...dummyContext,
        content: "{{macro foo bar}}",
        outputPath: "/foo/bar.html",
      };
      const result = evaluate(context)("{{content}}");
      expect(result, equals, "{{foo bar}}");
    });
  },
});
