export type OpaqueFile = {
  type: "opaque";
  outputPath: string;
  contents: Buffer;
};

export function OpaqueFile(path: string, contents: Buffer): OpaqueFile {
  return {
    type: "opaque",
    outputPath: path,
    contents,
  };
}

export function renderOpaqueFile(f: OpaqueFile): [string, Buffer] {
  return [f.outputPath, f.contents];
}
