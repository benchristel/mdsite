import "./cli/run";

import {
  getAllTests,
  runTests,
  formatTestResultsAsText,
} from "@benchristel/taste";

runTests(getAllTests()).then(formatTestResultsAsText).then(console.log);
