type Op<A, B> = (arg: A) => B;

export function pass<A, B>(a: A, f: Op<A, B>): B {
  return f(a);
}

export function pipe<A, B>(f1: Op<A, B>): Op<A, B>;
export function pipe<A, B, C>(f1: Op<A, B>, f2: Op<B, C>): Op<A, C>;
export function pipe<A, B, C, D>(
  f1: Op<A, B>,
  f2: Op<B, C>,
  f3: Op<C, D>
): Op<A, D>;
export function pipe(...fns: Function[]) {
  return fns.reduce((a: any, b: any) => pipe2(a, b));
}

function pipe2<A, B, C>(f1: Op<A, B>, f2: Op<B, C>): Op<A, C> {
  return (a) => f2(f1(a));
}

// @ts-expect-error
() => pipe(itoa, itoa);
// @ts-expect-error
() => pipe(atoi, atoi);
() => pipe(atoi, itoa);
() => pipe(itoa, atoi);

function itoa(i: number): string {
  return String(i);
}

function atoi(a: string): number {
  return +a;
}
