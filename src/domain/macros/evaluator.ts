import { macros, getTokens } from "./parser.js";
import { test, expect, equals, curry } from "@benchristel/taste";
import {
  ProjectGlobalInfo,
  dummyProjectGlobalInfo,
} from "../project-global-info.js";
import Logger, { mockLogger } from "../../lib/logger.js";
import { title as getTitle } from "../title.js";
import { htmlToc } from "../toc.js";
import { homeLink, nextLink, prevLink, upLink } from "../links.js";
import { htmlBreadcrumb } from "../breadcrumbs.js";

export type EvaluationContext = {
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

function evaluate(context: EvaluationContext): (macro: string) => string {
  return (macroStr) => compileMacro(macroStr)(context);
}

type Macro = (context: EvaluationContext) => string;

function compileMacro(macroStr: string): Macro {
  const [name, ...args] = getTokens(macroStr);
  const ctor = macroConstructors[name] ?? UndefinedMacro;
  return ctor(macroStr, args);
}

type MacroConstructor = (macroStr: string, args: string[]) => Macro;

const macroConstructors: Record<string, MacroConstructor> = {
  content,
  title,
  toc,
  next,
  prev,
  up,
  home,
  breadcrumb,
  macro,
};

function UndefinedMacro(macroStr: string): Macro {
  const [name] = getTokens(macroStr);
  return (context) => {
    Logger.warn(
      `warning: encountered unknown macro '${name}' while compiling ${context.outputPath}`
    );
    return macroStr;
  };
}

function content(): Macro {
  return (context) => context.content.replace(macros, evaluate(context));
}

function title(): Macro {
  return (context) => getTitle(context.outputPath, context.content);
}

function toc(_: string, args: string[]): Macro {
  return (context) =>
    htmlToc(context.globalInfo.orderedLinkables, context.outputPath, args[0]);
}

function next(): Macro {
  return (context) => nextLink(context.globalInfo, context.outputPath);
}

function prev(): Macro {
  return (context) => prevLink(context.globalInfo, context.outputPath);
}

function up(): Macro {
  return (context) => upLink(context.outputPath);
}

function home(): Macro {
  return (context) => homeLink(context.outputPath);
}

function breadcrumb(): Macro {
  return (context) => htmlBreadcrumb(context.outputPath, context.globalInfo);
}

function macro(macroStr: string): Macro {
  return () => macroStr.replace(/{{\s*macro\s+(.*)/, "{{$1");
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
