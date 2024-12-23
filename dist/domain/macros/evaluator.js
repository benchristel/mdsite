import { curry } from "@benchristel/taste";
import { macros, getTokens } from "./parser.js";
import Logger from "../../lib/logger.js";
import { homeLink, nextLink, prevLink, upLink } from "../links.js";
import { toc } from "./toc.js";
import { link } from "./link.js";
import { inputpath } from "./inputpath.js";
import { breadcrumb } from "./breadcrumb.js";
export const expandAllMacros = curry((context, htmlTemplate) => {
    return htmlTemplate.replace(macros, evaluate(context));
}, "expandAllMacros");
export function evaluate(context) {
    return (macroStr) => compileMacro(macroStr)(context);
}
function compileMacro(macroStr) {
    var _a;
    const [name, ...args] = getTokens(macroStr);
    const ctor = (_a = macroConstructors[name]) !== null && _a !== void 0 ? _a : UndefinedMacro;
    return ctor(macroStr, args);
}
const macroConstructors = {
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
    inputpath,
};
function UndefinedMacro(macroStr) {
    const [name] = getTokens(macroStr);
    return (context) => {
        Logger.warn(`warning: encountered unknown macro '${name}' while compiling ${context.outputPath}`);
        return macroStr;
    };
}
function content() {
    return (context) => context.content.replace(macros, evaluate(context));
}
function title() {
    return (context) => context.title;
}
function next() {
    return (context) => nextLink(context.globalInfo, context.outputPath);
}
function prev() {
    return (context) => prevLink(context.globalInfo, context.outputPath);
}
function up() {
    return (context) => upLink(context.outputPath);
}
function home() {
    return (context) => homeLink(context.outputPath);
}
function macro(macroStr) {
    return () => macroStr.replace(/{{\s*macro\s+(.*)/, "{{$1");
}
