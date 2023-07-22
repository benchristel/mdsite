import { test, expect, is } from "@benchristel/taste";
import { dummyProjectGlobalInfo, indexLinkables, } from "./project-global-info";
import { contains } from "../lib/strings";
import { dirname, join, relative } from "path";
export function htmlBreadcrumb(outputPath, globalInfo) {
    const crumbs = [];
    let path = outputPath;
    while (path !== "/index.html") {
        path = parentOf(path);
        crumbs.push(htmlCrumb(outputPath, path, globalInfo));
    }
    return `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb">${crumbs
        .reverse()
        .join("")}</nav>`;
}
test("htmlBreadcrumb", {
    "is empty on the top-level index page"() {
        const outputPath = "/index.html";
        const globalInfo = dummyProjectGlobalInfo;
        expect(htmlBreadcrumb(outputPath, globalInfo), is, `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb"></nav>`);
    },
    "displays the title of the parent index page"() {
        const outputPath = "/leaf.html";
        const globalInfo = Object.assign(Object.assign({}, dummyProjectGlobalInfo), indexLinkables([
            { path: "/index.html", title: "The Index Page" },
            { path: "/leaf.html", title: "A Leaf" },
        ]));
        expect(htmlBreadcrumb(outputPath, globalInfo), contains, `<a href="index.html">The Index Page</a>`);
    },
    "creates multiple breadcrumbs for a file in a directory"() {
        const outputPath = "/tree/leaf.html";
        const globalInfo = Object.assign(Object.assign({}, dummyProjectGlobalInfo), indexLinkables([
            { path: "/index.html", title: "The Index Page" },
            { path: "/tree/index.html", title: "A Nice Tree" },
            { path: "/tree/leaf.html", title: "A Leaf" },
        ]));
        expect(htmlBreadcrumb(outputPath, globalInfo), contains, `<a href="../index.html">The Index Page</a>` +
            `<a href="index.html">A Nice Tree</a>`);
    },
});
function htmlCrumb(from, to, globalInfo) {
    return `<a href="${relative(dirname(from), to)}">${globalInfo.orderedLinkables[globalInfo.index[to]].title}</a>`;
}
function parentOf(path) {
    if (path === "/index.html") {
        return "/index.html";
    }
    else if (path.endsWith("/index.html")) {
        return join(dirname(dirname(path)), "index.html");
    }
    else {
        return join(dirname(path), "index.html");
    }
}
test("parentOf", {
    "given /index.html"() {
        expect(parentOf("/index.html"), is, "/index.html");
    },
    "given /foo/index.html"() {
        expect(parentOf("/foo/index.html"), is, "/index.html");
    },
    "given /foo/bar/index.html"() {
        expect(parentOf("/foo/bar/index.html"), is, "/foo/index.html");
    },
    "given /foo/bar/baz.html"() {
        expect(parentOf("/foo/bar/baz.html"), is, "/foo/bar/index.html");
    },
});
