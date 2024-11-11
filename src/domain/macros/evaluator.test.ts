import { test, expect, is, equals } from "@benchristel/taste";
import { mockLogger } from "../../lib/logger.js";
import { evaluate, expandAllMacros } from "./evaluator.js";
import { Project } from "../project.js";
import { OutputPath } from "../output-path.js";

const of = OutputPath.of;

test("expandAllMacros", {
  "does nothing to the empty string"() {
    const htmlTemplate = "";
    const context = dummyContext;
    expect(expandAllMacros(context, htmlTemplate), is, "");
  },

  "expands a content macro"() {
    const htmlTemplate = "{{content}}";
    const context = { ...dummyContext, content: "hello" };
    expect(expandAllMacros(context, htmlTemplate), is, "hello");
  },

  "expands multiple macros"() {
    const htmlTemplate = "{{title}} {{content}} {{title}}";
    const context = {
      ...dummyContext,
      content: "<p>goodbye</p>",
      title: "hello",
    };
    expect(
      expandAllMacros(context, htmlTemplate),
      is,
      "hello <p>goodbye</p> hello"
    );
  },

  "is curried"() {
    const htmlTemplate = "{{content}}";
    const context = { ...dummyContext, content: "hello" };
    const expandAllInContext = expandAllMacros(context);
    expect(expandAllInContext(htmlTemplate), is, "hello");
  },
});

test("evaluating macros", {
  "logs a warning if the macro is unrecognized"() {
    const { warnings } = mockLogger(() => {
      const context = { ...dummyContext, outputPath: of("/my/file.html") };
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

  "gets {{title}} from the context"() {
    mockLogger(() => {
      const context = { ...dummyContext, title: "The Title" };
      const result = evaluate(context)("{{title}}");
      expect(result, equals, "The Title");
    });
  },

  "evaluates {{macro}}"() {
    mockLogger(() => {
      const context = {
        ...dummyContext,
        content: "{{macro foo bar}}",
        outputPath: of("/foo/bar.html"),
      };
      const result = evaluate(context)("{{content}}");
      expect(result, equals, "{{foo bar}}");
    });
  },
});

const dummyContext = {
  outputPath: OutputPath.of("/"),
  inputPath: "",
  content: "",
  title: "",
  globalInfo: new Project({}),
};
