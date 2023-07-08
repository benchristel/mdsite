import { macros, getTokens } from "./parser";
import { test, expect, is, equals, curry } from "@benchristel/taste";
import {
  ProjectGlobalInfo,
  dummyProjectGlobalInfo,
} from "../project-global-info";
import Logger, { mockLogger } from "../../lib/logger";
import { title as getTitle } from "../title";
import { htmlToc } from "../toc";
import { dirname } from "path";
import { homeLink, nextLink, prevLink, upLink } from "../links";

type EvaluationContext = {
  outputPath: string;
  content: string;
  globalInfo: ProjectGlobalInfo;
};

export const expandAll = curry(
  (context: EvaluationContext, htmlTemplate: string): string => {
    return htmlTemplate.replace(macros, evaluate(context));
  },
  "expandAll"
);

test("expandAll", {
  "does nothing to the empty string"() {
    const htmlTemplate = "";
    const context = dummyContext;
    expect(expandAll(context, htmlTemplate), is, "");
  },

  "expands a content macro"() {
    const htmlTemplate = "{{content}}";
    const context = { ...dummyContext, content: "hello" };
    expect(expandAll(context, htmlTemplate), is, "hello");
  },

  "expands multiple macros"() {
    const htmlTemplate = "{{title}} {{content}} {{title}}";
    const context = { ...dummyContext, content: "<h1>hello</h1>" };
    expect(expandAll(context, htmlTemplate), is, "hello <h1>hello</h1> hello");
  },

  "is curried"() {
    const htmlTemplate = "{{content}}";
    const context = { ...dummyContext, content: "hello" };
    const expandAllInContext = expandAll(context);
    expect(expandAllInContext(htmlTemplate), is, "hello");
  },
});

function evaluate(context: EvaluationContext): (macro: string) => string {
  return (macroStr) => {
    const tokens = getTokens(macroStr);
    const macroName = tokens[0];
    switch (macroName) {
      case "content":
        return content(context);
      case "title":
        return title(context);
      case "toc":
        return toc(context);
      case "next":
        return next(context);
      case "prev":
        return prev(context);
      case "up":
        return up(context);
      case "home":
        return home(context);
      case "macro":
        return macro(macroStr);
      default:
        Logger.warn(
          `warning: encountered unknown macro '${macroName}' while compiling ${context.outputPath}`
        );
        return macroStr;
    }
  };
}

function content(context: EvaluationContext): string {
  return context.content.replace(macros, evaluate(context));
}

function title(context: EvaluationContext): string {
  return getTitle(context.outputPath, context.content);
}

function toc(context: EvaluationContext): string {
  return htmlToc(context.globalInfo, dirname(context.outputPath));
}

function next(context: EvaluationContext): string {
  return nextLink(context.globalInfo, context.outputPath);
}

function prev(context: EvaluationContext): string {
  return prevLink(context.globalInfo, context.outputPath);
}

function up(context: EvaluationContext): string {
  return upLink(context.outputPath);
}

function home(context: EvaluationContext): string {
  return homeLink(context.outputPath);
}

function macro(macroStr: string): string {
  return macroStr.replace(/{{\s*macro\s+(.*)/, "{{$1");
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
