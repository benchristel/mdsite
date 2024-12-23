import { test, expect, equals } from "@benchristel/taste";
import { buffer } from "../../lib/buffer.js";
import { Project } from "../project";
import { link } from "./link.js";
import { OutputPath } from "../output-path.js";
const of = OutputPath.of;
test("{{link}}", {
    "creates a broken link given a file that does not exist"() {
        const project = new Project({});
        const context = Object.assign(Object.assign({}, contextDummies), { globalInfo: project, outputPath: of("/foo.html") });
        expect(link("", ["/does-not-exist.html"])(context), equals, `<a class="mdsite-broken-link" href="#">/does-not-exist.html</a>`);
    },
    "creates a link to a file"() {
        const project = new Project({
            "/link-to-me.html": buffer(""),
        });
        const context = Object.assign(Object.assign({}, contextDummies), { globalInfo: project, outputPath: of("/foo.html") });
        expect(link("", ["/link-to-me.html"])(context), equals, `<a href="/link-to-me.html">/link-to-me.html</a>`);
    },
    "resolves a partial path"() {
        const project = new Project({
            "/a/b/link-to-me.html": buffer(""),
        });
        const context = Object.assign(Object.assign({}, contextDummies), { globalInfo: project, outputPath: of("/foo.html") });
        expect(link("", ["link-to-me"])(context), equals, `<a href="/a/b/link-to-me.html">link-to-me</a>`);
    },
    "creates a broken link for an ambiguous path"() {
        const project = new Project({
            "/a/b/link-to-me.html": buffer(""),
            "/c/d/link-to-me.html": buffer(""),
        });
        const context = Object.assign(Object.assign({}, contextDummies), { globalInfo: project, outputPath: of("/foo.html") });
        expect(link("", ["link-to-me"])(context), equals, `<a class="mdsite-broken-link" href="#">link-to-me (ambiguous link)</a>`);
    },
    "uses the provided title"() {
        const project = new Project({
            "/link-to-me.html": buffer(""),
        });
        const context = Object.assign(Object.assign({}, contextDummies), { globalInfo: project, outputPath: of("/foo.html") });
        expect(link("", ["link-to-me", "The Title"])(context), equals, `<a href="/link-to-me.html">The Title</a>`);
    },
    "always uses the default title for a broken link"() {
        const project = new Project({});
        const context = Object.assign(Object.assign({}, contextDummies), { globalInfo: project, outputPath: of("/foo.html") });
        expect(link("", ["link-to-me", "The Title"])(context), equals, `<a class="mdsite-broken-link" href="#">link-to-me</a>`);
    },
});
const contextDummies = {
    content: "content is not used here",
    title: "title is not used here",
    inputPath: "inputPath is not used here",
};
