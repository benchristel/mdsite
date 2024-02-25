import type { ProjectGlobalInfo } from "../project-global-info";

export type Macro = (context: EvaluationContext) => string;

export type EvaluationContext = {
  outputPath: string;
  content: string;
  globalInfo: ProjectGlobalInfo;
};

export type MacroConstructor = (macroStr: string, args: string[]) => Macro;
