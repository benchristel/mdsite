import { FileSet } from "../lib/files";
import { buffer } from "../lib/buffer";
import { intoObject } from "../lib/objects";
import { dirname } from "path";
import { htmlToc } from "./toc";
import { trimMargin } from "../testing/formatting";
import { ProjectFileSet, parseProjectFiles } from "./project-file-set";
import { unreachable } from "../lib/unreachable";

export function buildProject(files: FileSet): FileSet {
  const projectFiles: ProjectFileSet = parseProjectFiles(files);

  return Object.entries(projectFiles)
    .map(([path, projectFile]) => {
      switch (projectFile.type) {
        case "opaque":
          return [path, projectFile.contents] as [string, Buffer];
        case "html":
          return [
            projectFile.outputPath,
            buffer(
              defaultTemplate
                .replace("{{markdown}}", projectFile.rawHtml)
                .replace("{{title}}", projectFile.title)
                .replace("{{toc}}", () =>
                  htmlToc(projectFiles, dirname(projectFile.outputPath))
                )
            ),
          ] as [string, Buffer];
        case "order":
          return [
            projectFile.outputPath,
            buffer(
              Object.keys(projectFile.ordering.indexForName).join("\n") +
                (projectFile.ordering.entriesWithUnspecifiedOrder.length
                  ? "\n\n!unspecified\n" +
                    projectFile.ordering.entriesWithUnspecifiedOrder.join("\n")
                  : "")
            ),
          ] as [string, Buffer];
        default:
          throw unreachable("unexpected type of project file", projectFile);
      }
    })
    .reduce(intoObject, {});
}

const defaultTemplate = trimMargin`
  <!DOCTYPE html>
  <html>
    <head>
      <title>{{title}}</title>
    </head>
    <body>
      {{markdown}}
    </body>
  </html>
`;
