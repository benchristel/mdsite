import { test, expect, is } from "@benchristel/taste";
import { title } from "./title.js";

test("title", {
  "extracts the title from an h1 tag"() {
    expect(title("", "<h1>foo</h1>"), is, "foo");
  },

  "extracts the title from an h1 tag with an id"() {
    expect(title("", `<h1 id="the-id">foo</h1>`), is, "foo");
  },

  "extracts the title from an h1 tag with child tags"() {
    expect(title("", `<h1><code>foo</code></h1>`), is, "foo");
  },

  "uses the title from the first h1 tag if there are several"() {
    expect(title("", `<h1>the title</h1><h1>not this</h1>`), is, "the title");
  },

  "defaults to the filename if there is no h1"() {
    expect(title("dir/file.html", `<p>whoa</p>`), is, "file.html");
  },

  "defaults to the filename if the h1 is empty"() {
    expect(title("file.html", `<h1></h1>`), is, "file.html");
  },

  "defaults to the name of the containing directory if the filename is index.html"() {
    expect(title("stuff/index.html", ""), is, "stuff");
  },

  "defaults to index.html for the root index"() {
    expect(title("/index.html", ""), is, "index.html");
  },
});
