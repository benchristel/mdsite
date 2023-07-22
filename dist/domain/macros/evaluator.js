import { macros, getTokens } from "./parser.js";
import { test, expect, equals, curry } from "@benchristel/taste";
import { dummyProjectGlobalInfo, } from "../project-global-info.js";
import Logger, { mockLogger } from "../../lib/logger.js";
import { title as getTitle } from "../title.js";
import { htmlToc } from "../toc.js";
import { homeLink, nextLink, prevLink, upLink } from "../links.js";
import { htmlBreadcrumb } from "../breadcrumbs.js";
export const expandAll = curry((context, htmlTemplate) => {
    return htmlTemplate.replace(macros, evaluate(context));
}, "expandAll");
function evaluate(context) {
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
    macro,
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
    return (context) => getTitle(context.outputPath, context.content);
}
function toc(_, args) {
    return (context) => htmlToc(context.globalInfo.orderedLinkables, context.outputPath, args[0]);
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
function breadcrumb() {
    return (context) => htmlBreadcrumb(context.outputPath, context.globalInfo);
}
function macro(macroStr) {
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
            const context = Object.assign(Object.assign({}, dummyContext), { outputPath: "/my/file.html" });
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
            const context = Object.assign(Object.assign({}, dummyContext), { content: "wow" });
            const result = evaluate(context)("{{content}}");
            expect(result, equals, "wow");
        });
    },
    "gets {{title}} from an <h1> element"() {
        mockLogger(() => {
            const context = Object.assign(Object.assign({}, dummyContext), { content: "<h1>The Title</h1>" });
            const result = evaluate(context)("{{title}}");
            expect(result, equals, "The Title");
        });
    },
    "defaults {{title}} to the filename"() {
        mockLogger(() => {
            const context = Object.assign(Object.assign({}, dummyContext), { outputPath: "/foo/bar.html" });
            const result = evaluate(context)("{{title}}");
            expect(result, equals, "bar.html");
        });
    },
    "evaluates {{title}} in the content"() {
        mockLogger(() => {
            const context = Object.assign(Object.assign({}, dummyContext), { content: "hello {{title}}", outputPath: "/foo/bar.html" });
            const result = evaluate(context)("{{content}}");
            expect(result, equals, "hello bar.html");
        });
    },
    "evaluates {{macro}}"() {
        mockLogger(() => {
            const context = Object.assign(Object.assign({}, dummyContext), { content: "{{macro foo bar}}", outputPath: "/foo/bar.html" });
            const result = evaluate(context)("{{content}}");
            expect(result, equals, "{{foo bar}}");
        });
    },
});
