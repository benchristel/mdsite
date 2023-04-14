import "./lib/markdown";
import "./lib/files";

import {
  getAllTests,
  runTests,
  formatTestResultsAsText,
} from "@benchristel/taste";

runTests(getAllTests()).then(formatTestResultsAsText).then(console.log);
