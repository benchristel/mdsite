import { buffer } from "../../lib/buffer";
import { pass, pipe } from "../../lib/functional";
import { expandAllMacros } from "../macros";
import { ProjectGlobalInfo } from "../project-global-info";
import { TemplatizedHtmlFile } from "./templatized-html-file";

export class MonolithicHtmlFile extends TemplatizedHtmlFile {
  render = (project: ProjectGlobalInfo): [string, Buffer] => {
    const { rawHtml: content, outputPath, inputPath, title } = this;
    const renderedHtml = pass(
      content,
      pipe(
        expandAllMacros({
          content,
          globalInfo: project,
          outputPath,
          inputPath,
          title,
        }),
        this.relativizeLinks
      )
    );
    return [outputPath.toString(), buffer(renderedHtml)];
  };
}
