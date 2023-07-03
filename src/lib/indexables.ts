export function first<T>(a: Array<T>): T | undefined {
  return a[0];
}

export function isEmpty(a: Array<unknown>): boolean {
  return a.length === 0;
}
