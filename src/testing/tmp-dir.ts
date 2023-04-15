import * as fs from "fs/promises";
import { join, dirname } from "path";

export interface TmpDir {
  read(path: string): Promise<string>;
  write(path: string, contents: string): Promise<void>;
  path(): Promise<string>;
  ls(): Promise<Array<string>>;
}

export function TmpDir(): TmpDir {
  let _tmp: string | undefined;
  async function tmp(): Promise<string> {
    if (!_tmp) {
      _tmp = await fs.mkdtemp("/tmp/test-");
    }
    return _tmp;
  }

  return {
    read,
    write,
    ls,
    path: tmp,
  };

  function read(path: string): Promise<string> {
    return tmp()
      .then((tmp) => fs.readFile(join(tmp, path)))
      .then((bytes) => bytes.toString());
  }

  function write(path: string, contents: string): Promise<void> {
    return tmp()
      .then(
        (tmp) => (fs.mkdir(join(tmp, dirname(path)), { recursive: true }), tmp)
      )
      .then((tmp) => fs.writeFile(join(tmp, path), contents));
  }

  function ls(): Promise<Array<string>> {
    return tmp().then((tmp) => fs.readdir(tmp));
  }
}
