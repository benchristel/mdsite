import { test, expect, is } from "@benchristel/taste";
import { MonolithicHtmlFile } from "./monolithic-html-file";
import { Project } from "../project";

const emptyProject = new Project({}, "");

test("MonolithicHtmlFile", {
  "renders the given html"() {
    const html = "<h1>Hello</h1>";
    const file = new MonolithicHtmlFile("/hello.html", html);
    const [_, rendered] = file.render(emptyProject);
    expect(rendered.toString(), is, "<h1>Hello</h1>");
  },

  "relativizes links"() {
    const html = `<a href="/blah.html"></a>`;
    const file = new MonolithicHtmlFile("/dir/hello.html", html);
    const [_, rendered] = file.render(emptyProject);
    expect(rendered.toString(), is, `<a href="../blah.html"></a>`);
  },

  "expands macros"() {
    const html = "{{title}}<h1>Hello</h1>";
    const file = new MonolithicHtmlFile("/hello.html", html);
    const [_, rendered] = file.render(emptyProject);
    expect(rendered.toString(), is, `Hello<h1>Hello</h1>`);
  },
});
