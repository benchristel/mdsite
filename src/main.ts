import { run } from "./cli/run";

run(process.argv.slice(2)).catch((e) => {
  console.log(e.message);
  process.exit(1);
});
