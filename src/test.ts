import { relative } from "path";
import { glob } from "glob";

import "./cli/run";
import "./domain/macros/index.js";

import {
  getAllTests,
  runTests,
  formatTestResultsAsText,
} from "@benchristel/taste";

glob("./**/*.test.ts")
  .then((paths) =>
    Promise.all(paths.map((path) => import("./" + relative(__dirname, path))))
  )
  .then(() => runTests(getAllTests()))
  .then(formatTestResultsAsText)
  .then(console.log);
