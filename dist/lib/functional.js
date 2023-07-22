export function pass(a, f) {
    return f(a);
}
export function pipe(...fns) {
    return fns.reduce((a, b) => pipe2(a, b));
}
function pipe2(f1, f2) {
    return (a) => f2(f1(a));
}
// @ts-expect-error
() => pipe(itoa, itoa);
// @ts-expect-error
() => pipe(atoi, atoi);
() => pipe(atoi, itoa);
() => pipe(itoa, atoi);
function itoa(i) {
    return String(i);
}
function atoi(a) {
    return +a;
}
