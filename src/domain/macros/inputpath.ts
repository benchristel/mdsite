import { Macro } from "./types";

export function inputpath(_: string, __: string[]): Macro {
  return (context) => context.inputPath;
}
