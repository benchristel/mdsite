import { macros, getTokens } from "./parser";
import { test, expect, equals } from "@benchristel/taste";
import {
  ProjectGlobalInfo,
  dummyProjectGlobalInfo,
} from "../project-global-info";
import Logger, { mockLogger } from "../../lib/logger";
import { title } from "../title";
import { htmlToc } from "../toc";
import { dirname } from "path";
import { homeLink, nextLink, prevLink, upLink } from "../links";

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
