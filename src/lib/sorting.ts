export function by<T>(
  projection: (obj: T) => string
): (a: T, b: T) => -1 | 0 | 1 {
  return (a, b) => {
    const aKey = projection(a);
    const bKey = projection(b);
    if (aKey > bKey) {
      return 1;
    } else if (aKey < bKey) {
      return -1;
    } else {
      return 1;
    }
  };
}
