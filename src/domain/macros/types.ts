import type { ProjectGlobalInfo } from "../project-global-info.js";

export type Macro = (context: EvaluationContext) => string;

export type EvaluationContext = {
  outputPath: string;
  content: string;
  title: string;
  globalInfo: ProjectGlobalInfo;
};

export type MacroConstructor = (macroStr: string, args: string[]) => Macro;
