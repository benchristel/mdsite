import { FileSet } from "../lib/files.js";
import { mapEntries } from "../lib/objects.js";
import {
  ProjectFile,
  ProjectFileSet,
  pathAndBufferToProjectFile,
} from "./files/project-file-set.js";
import { addSyntheticFiles } from "./synthetic-files.js";
import type { Linkable, ProjectGlobalInfo } from "./project-global-info.js";
import { sortHtmlFiles } from "./order.js";

export function buildProject(files: FileSet, template: string): FileSet {
  return new Project(files, template).build();
}

export class Project implements ProjectGlobalInfo {
  files: ProjectFileSet;
  template: string;
  #orderedLinkables: Linkable[] | undefined;
  #index: Record<string, number> | undefined;

  constructor(files: FileSet, template: string = "dummy template") {
    this.files = mapEntries(
      addSyntheticFiles(files),
      pathAndBufferToProjectFile
    );
    this.template = template;
  }

  build() {
    return mapEntries(this.files, ([_, projectFile]) => {
      return projectFile.render(this);
    });
  }

  get orderedLinkables(): Linkable[] {
    return (this.#orderedLinkables ??= sortHtmlFiles(this.files).map((path) =>
      Linkable(this.files[path])
    ));
  }

  get index(): Record<string, number> {
    return (this.#index ??= indexLinkables(this.orderedLinkables).index);
  }
}

export function indexLinkables(linkables: Linkable[]): {
  index: Record<string, number>;
  orderedLinkables: Linkable[];
} {
  const index: Record<string, number> = {};
  linkables.forEach((linkable, i) => {
    index[linkable.path] = i;
  });
  return {
    orderedLinkables: linkables,
    index,
  };
}

function Linkable(file: ProjectFile) {
  return {
    path: file.outputPath,
    title: file.type === "html" ? file.title : "",
  };
}
