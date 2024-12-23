import { test, expect, equals, not } from "@benchristel/taste";
import { trimMargin } from "../../testing/formatting.js";
import { OrderFile, isOrderFile } from "./order-file.js";
import { Project } from "../project.js";
import { buffer } from "../../lib/buffer.js";
test("OrderFile", {
    "parses a blank file"() {
        const orderFile = new OrderFile("/order.txt", "");
        expect(orderFile.filenames, equals, []);
    },
    "parses a file with one filename"() {
        const orderFile = new OrderFile("", "foo.html");
        expect(orderFile.filenames, equals, ["foo.html"]);
    },
    "converts .md filenames to .html"() {
        const orderFile = new OrderFile("", "foo.md");
        expect(orderFile.filenames, equals, ["foo.html"]);
    },
    "ignores files below the '!unspecified' line"() {
        const orderFile = new OrderFile("", trimMargin `
      in.html
      !unspecified
      out.html
    `);
        expect(orderFile.filenames, equals, ["in.html"]);
    },
    "handles input that starts with '!unspecified'"() {
        const orderFile = new OrderFile("", trimMargin `
      !unspecified
      out.html
    `);
        expect(orderFile.filenames, equals, []);
    },
    "ignores blank lines"() {
        const orderFile = new OrderFile("", trimMargin `
      a.html
      
      b.html

    `);
        expect(orderFile.filenames, equals, ["a.html", "b.html"]);
    },
    "trims space from each line"() {
        const orderFile = new OrderFile("", "  a.html  ");
        expect(orderFile.filenames, equals, ["a.html"]);
    },
    "ignores leading/trailing slashes"() {
        const orderFile = new OrderFile("", trimMargin `
      /a.html
      b/
    `);
        expect(orderFile.filenames, equals, ["a.html", "b"]);
    },
    "does not list index.html in the !unspecified section"() {
        const orderFile = new OrderFile("/order.txt", "");
        const project = new Project({
            "/a.html": buffer(""),
            "/b.html": buffer(""),
            "/index.html": buffer(""),
        });
        expect(String(orderFile.render(project)[1]), equals, trimMargin `
      
      !unspecified
      a.html
      b.html
      
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
