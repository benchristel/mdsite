export function OpaqueFile(path, contents) {
    return {
        type: "opaque",
        outputPath: path,
        contents,
        render: () => [path, contents],
    };
}
