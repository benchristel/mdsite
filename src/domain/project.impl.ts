import { FileSet, buffer } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { intoObject } from "../lib/objects";
import { dirname, join, relative } from "path";
import "./toc";
import { htmlToc } from "./toc";
import { title } from "./title";
import { trimMargin } from "../testing/formatting";

export function buildProject(files: FileSet): FileSet {
  files = addMissingIndexFiles(files);

  files = Object.entries(files)
    .map(([srcPath, srcContents]) => {
      if (srcPath.endsWith(".md")) {
        const htmlPath = srcPath.replace(/\.md$/, ".html");
        let htmlContents = defaultTemplate.replace(
          "{{markdown}}",
          htmlFromMarkdown(srcContents.toString()).trim()
        );
        htmlContents = htmlContents.replace(
          "{{title}}",
          title(htmlPath, htmlContents)
        );

        return [htmlPath, buffer(htmlContents)] as [string, Buffer];
      } else {
        return [srcPath, srcContents] as [string, Buffer];
      }
    })
    .reduce(intoObject, {});

  files = Object.entries(files)
    .map(([path, contents]) => {
      if (path.endsWith(".html")) {
        return [
          path,
          buffer(
            contents
              .toString()
              .replace("{{toc}}", htmlToc(files, dirname(path)))
          ),
        ] as [string, Buffer];
      } else {
        return [path, contents] as [string, Buffer];
      }
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
