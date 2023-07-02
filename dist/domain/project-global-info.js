import { isAnything } from "../testing/matchers.js";
import { HtmlFile } from "./html-file.js";
import { Order, sortHtmlFiles } from "./order.js";
import { test, expect, equals, which } from "@benchristel/taste";
export const dummyProjectGlobalInfo = {
    orderedLinkables: [],
    index: {},
    template: "dummy template",
};
export function ProjectGlobalInfo(files, template) {
    const order = Order(sortHtmlFiles(files));
    return {
        orderedLinkables: order.items.map((path) => Linkable(files[path])),
        index: order.index,
        template,
    };
}
function Linkable(file) {
    return {
        path: file.outputPath,
        title: file.type === "html" ? file.title : "",
    };
}
test("ProjectGlobalInfo", {
    "is empty given no files"() {
        const files = {};
        expect(ProjectGlobalInfo(files, ""), equals, {
            orderedLinkables: [],
            index: {},
            template: which(isAnything),
        });
    },
    "given one file"() {
        const files = {
            "/a.html": HtmlFile("/a.html", ""),
        };
        expect(ProjectGlobalInfo(files, ""), equals, {
            orderedLinkables: [{ path: "/a.html", title: "a.html" }],
            index: { "/a.html": 0 },
            template: which(isAnything),
        });
    },
    "given a template"() {
        const files = {};
        expect(ProjectGlobalInfo(files, "the-template").template, equals, "the-template");
    },
    "given several files"() {
        const files = {
            "/b.html": HtmlFile("/b.html", ""),
            "/d.html": HtmlFile("/d.html", ""),
            "/c.html": HtmlFile("/c.html", ""),
            "/a.html": HtmlFile("/a.html", ""),
        };
        expect(ProjectGlobalInfo(files, ""), equals, {
            orderedLinkables: [
                { path: "/a.html", title: "a.html" },
                { path: "/b.html", title: "b.html" },
                { path: "/c.html", title: "c.html" },
                { path: "/d.html", title: "d.html" },
            ],
            index: {
                "/a.html": 0,
                "/b.html": 1,
                "/c.html": 2,
                "/d.html": 3,
            },
            template: which(isAnything),
        });
    },
});
