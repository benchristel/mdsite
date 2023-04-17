import { FileSet, buffer } from "../lib/files";
import { intoObject } from "../lib/objects";
import { dirname, join, relative } from "path";
import { htmlToc } from "./toc";
import { trimMargin } from "../testing/formatting";
import { ProjectFileSet, parseProjectFiles } from "./project-file-set";

export function buildProject(files: FileSet): FileSet {
  files = addMissingIndexFiles(files);
  const projectFiles: ProjectFileSet = parseProjectFiles(files);

  return Object.entries(projectFiles)
    .map(([path, projectFile]) => {
      if (projectFile.fate === "preserve") {
        return [path, projectFile.contents] as [string, Buffer];
      } else {
        return [
          projectFile.htmlPath,
          buffer(
            defaultTemplate
              .replace("{{markdown}}", projectFile.rawHtml)
              .replace("{{title}}", projectFile.title)
              .replace("{{toc}}", () =>
                htmlToc(projectFiles, dirname(projectFile.htmlPath))
              )
          ),
        ] as [string, Buffer];
      }
    })
    .reduce(intoObject, {});
}

export function addMissingIndexFiles(files: FileSet): FileSet {
  files = { ...files };
  if (!("/index.md" in files)) {
    files["/index.md"] = buffer("# Homepage\n\n{{toc}}");
  }
  const directories = [];
  for (let path of Object.keys(files)) {
    while (path.length > 1) {
      path = dirname(path);
      directories.push(path);
    }
  }
  for (const dir of directories) {
    const indexPath = join(dir, "index.md");
    if (!(indexPath in files)) {
      files[indexPath] = buffer(
        "# Index of " + relative("/", dir) + "\n\n{{toc}}"
      );
    }
  }
  return files;
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
