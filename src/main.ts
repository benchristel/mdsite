#!/usr/bin/env node
import { run } from "./cli/run.js";

run(process.argv.slice(2)).catch((e) => {
  console.log(e.message);
  process.exit(1);
});
