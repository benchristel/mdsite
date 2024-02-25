import { test, expect, equals, not } from "@benchristel/taste";
import { trimMargin } from "../../testing/formatting.js";
import { OrderFile, isOrderFile } from "./order-file.js";
test("OrderFile", {
    "parses a blank file"() {
        const orderFile = OrderFile("/order.txt", "");
        expect(orderFile.filenames, equals, []);
    },
    "parses a file with one filename"() {
        const orderFile = OrderFile("", "foo.html");
        expect(orderFile.filenames, equals, ["foo.html"]);
    },
    "converts .md filenames to .html"() {
        const orderFile = OrderFile("", "foo.md");
        expect(orderFile.filenames, equals, ["foo.html"]);
    },
    "ignores files below the '!unspecified' line"() {
        const orderFile = OrderFile("", trimMargin `
      in.html
      !unspecified
      out.html
    `);
        expect(orderFile.filenames, equals, ["in.html"]);
    },
    "handles input that starts with '!unspecified'"() {
        const orderFile = OrderFile("", trimMargin `
      !unspecified
      out.html
    `);
        expect(orderFile.filenames, equals, []);
    },
    "ignores blank lines"() {
        const orderFile = OrderFile("", trimMargin `
      a.html
      
      b.html

    `);
        expect(orderFile.filenames, equals, ["a.html", "b.html"]);
    },
    "trims space from each line"() {
        const orderFile = OrderFile("", "  a.html  ");
        expect(orderFile.filenames, equals, ["a.html"]);
    },
    "ignores leading/trailing slashes"() {
        const orderFile = OrderFile("", trimMargin `
      /a.html
      b/
    `);
        expect(orderFile.filenames, equals, ["a.html", "b"]);
    },
    "removes index.html (which has no effect) when rendering"() {
        const orderFile = OrderFile("/order.txt", trimMargin `
      a
      index.html
      b
    `);
        const globalProjectInfo = {
            index: {},
            template: "",
            orderedLinkables: [
                { path: "/a", title: "" },
                { path: "/b", title: "" },
                { path: "/index.html", title: "" },
            ],
        };
        expect(String(orderFile.render(globalProjectInfo)[1]), equals, "a\nb\n");
    },
    "removes index.md (which has no effect) when rendering"() {
        const orderFile = OrderFile("/order.txt", trimMargin `
      a
      index.md
      b
    `);
        const globalProjectInfo = {
            index: {},
            template: "",
            orderedLinkables: [
                { path: "/a", title: "" },
                { path: "/b", title: "" },
                { path: "/index.html", title: "" },
            ],
        };
        expect(String(orderFile.render(globalProjectInfo)[1]), equals, "a\nb\n");
    },
    "does not list index.html in the !unspecified section"() {
        const orderFile = OrderFile("/order.txt", "");
        const globalProjectInfo = {
            index: {},
            template: "",
            orderedLinkables: [
                { path: "/a", title: "" },
                { path: "/b", title: "" },
                { path: "/index.html", title: "" },
            ],
        };
        expect(String(orderFile.render(globalProjectInfo)[1]), equals, trimMargin `
      
      !unspecified
      a
      b
      
    `);
    },
});
test("isOrderFile", {
    "is true given /order.txt"() {
        expect("/order.txt", isOrderFile);
    },
    "is false given /foo.txt"() {
        expect("/foo.txt", not(isOrderFile));
    },
    "is true given /foo/order.txt"() {
        expect("/foo/order.txt", isOrderFile);
    },
    "is false given /order.html"() {
        expect("/order.html", not(isOrderFile));
    },
});
