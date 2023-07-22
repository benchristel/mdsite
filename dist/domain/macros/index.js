export { expandAll } from "./evaluator.js";
import { dummyProjectGlobalInfo, } from "../project-global-info.js";
import { expandAll } from "./evaluator.js";
import { test, expect, is } from "@benchristel/taste";
{
    expandAll;
}
test("expandAll", {
    "does nothing to the empty string"() {
        const htmlTemplate = "";
        const context = dummyContext;
        expect(expandAll(context, htmlTemplate), is, "");
    },
    "expands a content macro"() {
        const htmlTemplate = "{{content}}";
        const context = Object.assign(Object.assign({}, dummyContext), { content: "hello" });
        expect(expandAll(context, htmlTemplate), is, "hello");
    },
    "expands multiple macros"() {
        const htmlTemplate = "{{title}} {{content}} {{title}}";
        const context = Object.assign(Object.assign({}, dummyContext), { content: "<h1>hello</h1>" });
        expect(expandAll(context, htmlTemplate), is, "hello <h1>hello</h1> hello");
    },
    "is curried"() {
        const htmlTemplate = "{{content}}";
        const context = Object.assign(Object.assign({}, dummyContext), { content: "hello" });
        const expandAllInContext = expandAll(context);
        expect(expandAllInContext(htmlTemplate), is, "hello");
    },
});
const dummyContext = {
    outputPath: "",
    content: "",
    globalInfo: dummyProjectGlobalInfo,
};
