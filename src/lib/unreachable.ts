export function unreachable(message: string, v: never): Error {
  return Error(
    message + ": " + v === undefined ? "undefined" : JSON.stringify(v)
  );
}
