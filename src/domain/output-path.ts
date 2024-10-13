import { normalize, dirname, basename, relative, join } from "path";
import { isRelative } from "../lib/paths";

export class OutputPath {
  private constructor(private string: string) {}

  toString() {
    return this.string;
  }

  is(other: string | OutputPath): boolean {
    if (typeof other === "string") {
      return other === this.string;
    } else {
      return other.is(this.string);
    }
  }

  hasParent(): boolean {
    return this.string !== "/index.html";
  }

  isHtml(): boolean {
    return this.string.endsWith(".html");
  }

  isIndexHtml(): boolean {
    return this.string.endsWith("/index.html");
  }

  basename(): string {
    return basename(this.string);
  }

  dirname(): string {
    return dirname(this.string);
  }

  isIn(directory: string): boolean {
    // TODO: support Windows paths?
    if (!directory.startsWith("/")) {
      return false;
    }
    if (!directory.endsWith("/")) {
      directory = directory + "/";
    }

    return this.string.startsWith(directory);
  }

  parentIndexPath(): OutputPath {
    return OutputPath.of(this.parentPathStr());
  }

  relativePathOf(other: string | OutputPath): string {
    const otherStr = other.toString();
    if (isRelative(otherStr)) {
      return otherStr;
    }
    return relative(this.dirname(), otherStr);
  }

  private parentPathStr() {
    let path = this.string;
    if (path === "/index.html") {
      return "/index.html";
    } else if (path.endsWith("/index.html")) {
      return join(dirname(dirname(path)), "index.html");
    } else {
      return join(dirname(path), "index.html");
    }
  }

  static of(inputPath: string): OutputPath {
    return new OutputPath(normalize(inputPath.replace(/\.md$/, ".html")));
  }
}
