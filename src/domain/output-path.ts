import { normalize, dirname, basename, relative } from "path";
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

  relativePathOf(other: string | OutputPath): string {
    const otherStr = other.toString();
    if (isRelative(otherStr)) {
      return otherStr;
    }
    return relative(this.dirname(), otherStr);
  }

  static of(inputPath: string): OutputPath {
    return new OutputPath(normalize(inputPath.replace(mdExtension, ".html")));
  }
}

const mdExtension = /\.md$/;
