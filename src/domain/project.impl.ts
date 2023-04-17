import { FileSet, buffer } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { intoObject } from "../lib/objects";
import { dirname, join, relative } from "path";
import "./toc";
import { htmlToc } from "./toc";
import { title } from "./title";
import { trimMargin } from "../testing/formatting";
import {
  ProjectFile,
  ProjectFileSet,
  parseProjectFiles,
} from "./project-file-set";

export function buildProject(files: FileSet): FileSet {
  files = addMissingIndexFiles(files);

  const projectFiles: ProjectFileSet = parseProjectFiles(files);
  // .map(([srcPath, srcContents]) => {
  //   const projectFile = ProjectFile(srcPath, srcContents)
  //   if (projectFile.fate === "preserve") {
  //     return [srcPath, projectFile] as [string, ProjectFile]
  //   } else {
  //     return [projectFile.htmlPath, projectFile] as [string, ProjectFile]
  //   }

  //   // if (srcPath.endsWith(".md")) {
  //   //   const htmlPath = srcPath.replace(/\.md$/, ".html");
  //   //   let htmlContents = defaultTemplate.replace(
  //   //     "{{markdown}}",
  //   //     htmlFromMarkdown(srcContents.toString()).trim()
  //   //   );
  //   //   htmlContents = htmlContents.replace(
  //   //     "{{title}}",
  //   //     title(htmlPath, htmlContents)
  //   //   );

  //   //   return [htmlPath, buffer(htmlContents)] as [string, Buffer];
  //   // } else {
  //   //   return [srcPath, srcContents] as [string, Buffer];
  //   // }
  // })
  // .reduce(intoObject, {});

  files = Object.entries(projectFiles)
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
              .replace(
                "{{toc}}",
                htmlToc(projectFiles, dirname(projectFile.htmlPath))
              )
          ),
        ] as [string, Buffer];
      }
      // if (path.endsWith(".html")) {
      //   return [
      //     path,
      //     buffer(
      //       contents
      //         .toString()
      //         .replace("{{toc}}", htmlToc(files, dirname(path)))
      //     ),
      //   ] as [string, Buffer];
      // } else {
      //   return [path, contents] as [string, Buffer];
      // }
    })
    .reduce(intoObject, {});
  return files;
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
