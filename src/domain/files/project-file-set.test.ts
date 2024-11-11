import { test, expect } from "@benchristel/taste";
import { ProjectFile } from "./project-file-set";
import { TemplatizedHtmlFile } from "./templatized-html-file";
import { buffer } from "../../lib/buffer";
import { OrderFile } from "./order-file";
import { MonolithicHtmlFile } from "./monolithic-html-file";

test("ProjectFile", {
  "creates an HTML file given an .html path"() {
    const file = ProjectFile("/foo.html", buffer(""));
    expect(file, isInstanceOf, TemplatizedHtmlFile);
  },

  "creates an HTML file given an .md path"() {
    const file = ProjectFile("/foo.md", buffer(""));
    expect(file, isInstanceOf, TemplatizedHtmlFile);
  },

  "creates a monolithic (no-template) HTML file given content starting with <!DOCTYPE"() {
    const file = ProjectFile("/foo.html", buffer("<!DOCTYPE html>"));
    expect(file, isInstanceOf, MonolithicHtmlFile);
  },

  "creates a monolithic (no-template) HTML file given content starting with <!doctype"() {
    const file = ProjectFile("/foo.html", buffer("<!doctype html>"));
    expect(file, isInstanceOf, MonolithicHtmlFile);
  },

  "creates a monolithic (no-template) HTML file given content starting with <html"() {
    const file = ProjectFile("/foo.html", buffer("<html>"));
    expect(file, isInstanceOf, MonolithicHtmlFile);
  },

  "creates a monolithic (no-template) HTML file given content starting with <HTML"() {
    const file = ProjectFile("/foo.html", buffer("<HTML>"));
    expect(file, isInstanceOf, MonolithicHtmlFile);
  },

  "creates a monolithic (no-template) HTML file given content starting with whitespace"() {
    const file = ProjectFile("/foo.html", buffer("  \n\t<HTML>"));
    expect(file, isInstanceOf, MonolithicHtmlFile);
  },

  "creates an Order file given an order.txt path"() {
    const file = ProjectFile("/order.txt", buffer(""));
    expect(file, isInstanceOf, OrderFile);
  },
});

function isInstanceOf(_class: any, object: any): boolean {
  return object instanceof _class;
}
