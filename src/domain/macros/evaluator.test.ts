import { test, expect, is, equals } from "@benchristel/taste";
import { mockLogger } from "../../lib/logger.js";
import { evaluate, expandAll } from "./evaluator.js";
import { Project } from "../project.js";

test("expandAll", {
  "does nothing to the empty string"() {
    const htmlTemplate = "";
    const context = dummyContext;
    expect(expandAll(context, htmlTemplate), is, "");
  },

  "expands a content macro"() {
    const htmlTemplate = "{{content}}";
    const context = { ...dummyContext, content: "hello" };
    expect(expandAll(context, htmlTemplate), is, "hello");
  },

  "expands multiple macros"() {
    const htmlTemplate = "{{title}} {{content}} {{title}}";
    const context = { ...dummyContext, content: "<h1>hello</h1>" };
    expect(expandAll(context, htmlTemplate), is, "hello <h1>hello</h1> hello");
  },

  "is curried"() {
    const htmlTemplate = "{{content}}";
    const context = { ...dummyContext, content: "hello" };
    const expandAllInContext = expandAll(context);
    expect(expandAllInContext(htmlTemplate), is, "hello");
  },
});

test("evaluating macros", {
  "logs a warning if the macro is unrecognized"() {
    const { warnings } = mockLogger(() => {
      const context = { ...dummyContext, outputPath: "/my/file.html" };
      evaluate(context)("{{foo}}");
    });

    expect(warnings, equals, [
      [
        "warning: encountered unknown macro 'foo' while compiling /my/file.html",
      ],
    ]);
  },

  "evalutes {{content}}"() {
    mockLogger(() => {
      const context = { ...dummyContext, content: "wow" };
      const result = evaluate(context)("{{content}}");
      expect(result, equals, "wow");
    });
  },

  "gets {{title}} from an <h1> element"() {
    mockLogger(() => {
      const context = { ...dummyContext, content: "<h1>The Title</h1>" };
      const result = evaluate(context)("{{title}}");
      expect(result, equals, "The Title");
    });
  },

  "defaults {{title}} to the filename"() {
    mockLogger(() => {
      const context = { ...dummyContext, outputPath: "/foo/bar.html" };
      const result = evaluate(context)("{{title}}");
      expect(result, equals, "bar.html");
    });
  },

  "evaluates {{title}} in the content"() {
    mockLogger(() => {
      const context = {
        ...dummyContext,
        content: "hello {{title}}",
        outputPath: "/foo/bar.html",
      };
      const result = evaluate(context)("{{content}}");
      expect(result, equals, "hello bar.html");
    });
  },

  "evaluates {{macro}}"() {
    mockLogger(() => {
      const context = {
        ...dummyContext,
        content: "{{macro foo bar}}",
        outputPath: "/foo/bar.html",
      };
      const result = evaluate(context)("{{content}}");
      expect(result, equals, "{{foo bar}}");
    });
  },
});

const dummyContext = {
  outputPath: "",
  content: "",
  globalInfo: new Project({}),
};
