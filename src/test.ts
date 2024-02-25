import { glob } from "glob";

import "./cli/run";
import "./domain/macros/index.js";

import {
  getAllTests,
  runTests,
  formatTestResultsAsText,
} from "@benchristel/taste";

glob(`${__dirname}/**/*.test.ts`)
  .then((paths) => Promise.all(paths.map((path) => import(path))))
  .then(() => runTests(getAllTests()))
  .then(formatTestResultsAsText)
  .then(console.log);
