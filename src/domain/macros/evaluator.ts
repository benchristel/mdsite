import { curry } from "@benchristel/taste";
import { macros, getTokens } from "./parser.js";
import Logger from "../../lib/logger.js";
import { title as getTitle } from "../files/title.js";
import { homeLink, nextLink, prevLink, upLink } from "../links.js";
import { htmlBreadcrumb } from "../breadcrumbs.js";
import { EvaluationContext, Macro, MacroConstructor } from "./types.js";
import { toc } from "./toc.js";
import { link } from "./link.js";

export const expandAll = curry(
  (context: EvaluationContext, htmlTemplate: string): string => {
    return htmlTemplate.replace(macros, evaluate(context));
  },
  "expandAll"
);

export function evaluate(
  context: EvaluationContext
): (macro: string) => string {
  return (macroStr) => compileMacro(macroStr)(context);
}

function compileMacro(macroStr: string): Macro {
  const [name, ...args] = getTokens(macroStr);
  const ctor = macroConstructors[name] ?? UndefinedMacro;
  return ctor(macroStr, args);
}

const macroConstructors: Record<string, MacroConstructor> = {
  content,
  title,
  toc,
  next,
  prev,
  up,
  home,
  breadcrumb,
  link,
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
