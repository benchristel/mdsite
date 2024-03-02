import { FileSet } from "../lib/files.js";
import { mapEntries } from "../lib/objects.js";
import {
  ProjectFileSet,
  pathAndBufferToProjectFile,
} from "./files/project-file-set.js";
import { addSyntheticFiles } from "./synthetic-files.js";
import type { Linkable, ProjectGlobalInfo } from "./project-global-info.js";
import { Entry, sortEntries } from "./order.js";

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
    return (this.#orderedLinkables ??= sortEntries(this.files)
      .filter((e) => e.type === "html")
      .map(Linkable));
  }

  get orderedEntries(): Entry[] {
    return sortEntries(this.files);
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

function Linkable({ path, title }: Entry) {
  return { path, title };
}
