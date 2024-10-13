import { test, expect, is } from "@benchristel/taste";
import { breadcrumb } from "./breadcrumb";
import { OutputPath } from "../output-path";
import { Project } from "../project";
test("{{breadcrumb}}", {
    "is empty on the index page"() {
        const context = Object.assign(Object.assign({}, contextDummies), { outputPath: OutputPath.of("/index.html") });
        const result = breadcrumb("", [])(context);
        expect(result, is, `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb"></nav>`);
    },
    "on a child page, links to the index page"() {
        const context = Object.assign(Object.assign({}, contextDummies), { outputPath: OutputPath.of("/foo.html") });
        const result = breadcrumb("", [])(context);
        expect(result, is, `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb"><a href="index.html">Homepage</a></nav>`);
    },
    "omits the <nav> wrapper when --no-nav is passed"() {
        const context = Object.assign(Object.assign({}, contextDummies), { outputPath: OutputPath.of("/foo.html") });
        const result = breadcrumb("", ["--no-nav"])(context);
        expect(result, is, `<a href="index.html">Homepage</a>`);
    },
});
const contextDummies = {
    content: "content is not used here",
    title: "title is not used here",
    inputPath: "inputPath is not used here",
    globalInfo: new Project({}),
};
