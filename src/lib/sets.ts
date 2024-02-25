export function diff<T>(a: Set<T>, b: Set<T>): Set<T> {
  const ret = new Set<T>();
  for (const member of a) {
    if (!b.has(member)) {
      ret.add(member);
    }
  }
  return ret;
}
