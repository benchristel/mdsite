export function unreachable(message, v) {
    return Error(message + ": " + v === undefined ? "undefined" : JSON.stringify(v));
}
