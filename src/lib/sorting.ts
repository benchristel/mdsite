export type Criterion<T> = ((obj: T) => string) | ((obj: T) => number);

export type Comparator<T> = (a: T, b: T) => -1 | 0 | 1;

export function by<T>(...criteria: Array<Criterion<T>>): Comparator<T> {
  return (a, b) => {
    for (const criterion of criteria) {
      const aKey = criterion(a);
      const bKey = criterion(b);
      if (aKey > bKey) {
        return 1;
      } else if (aKey < bKey) {
        return -1;
      }
    }
    return 0;
  };
}
