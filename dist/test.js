import "./cli/run";
import "./domain/macros/index.js";
import { getAllTests, runTests, formatTestResultsAsText, } from "@benchristel/taste";
runTests(getAllTests()).then(formatTestResultsAsText).then(console.log);
