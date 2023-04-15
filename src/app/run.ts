import { readTree, writeTree, mapTree } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";

export function run() {
  build();
}

async function build() {
  const input = await readTree("src");
  const output = mapTree(input, (file) => {
    return {
      ...file,
      name: file.name.replace(/\.md$/, ".html"),
      contents: htmlFromMarkdown(file.contents),
    };
  });
  await writeTree("docs", output);
}
