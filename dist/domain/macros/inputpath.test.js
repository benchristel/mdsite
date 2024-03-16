import { test, expect, is } from "@benchristel/taste";
import { Project } from "../project";
import { inputpath } from "./inputpath";
test("inputpath", {
    "expands to the inputPath of the current file"() {
        const project = new Project({});
        const context = Object.assign(Object.assign({}, contextDummies), { inputPath: "/foo/bar.md", globalInfo: project });
        expect(inputpath("", [])(context), is, "/foo/bar.md");
    },
});
const contextDummies = {
    content: "content is not used here",
    title: "title is not used here",
    outputPath: "outputPath is not used here",
};
