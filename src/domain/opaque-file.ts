export type OpaqueFile = {
  type: "opaque";
  outputPath: string;
  contents: Buffer;
  render: () => [string, Buffer];
};

export function OpaqueFile(path: string, contents: Buffer): OpaqueFile {
  return {
    type: "opaque",
    outputPath: path,
    contents,
    render: () => [path, contents],
  };
}
