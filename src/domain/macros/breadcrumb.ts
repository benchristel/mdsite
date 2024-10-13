import { htmlBreadcrumb } from "../breadcrumbs";
import { Macro } from "./types";

export function breadcrumb(): Macro {
  return (context) => htmlBreadcrumb(context.outputPath, context.globalInfo);
}
