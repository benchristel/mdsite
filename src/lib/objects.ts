export function intoObject<K extends string | number | symbol, V>(
  obj: Record<K, V>,
  [k, v]: [K, V]
): Record<K, V> {
  obj[k] = v;
  return obj;
}

export function valuesToStrings<K extends string | number | symbol>(
  obj: Record<K, unknown>
): Record<K, string> {
  return Object.entries(obj)
    .map(([k, v]) => [k, String(v)] as [K, string])
    .reduce(intoObject, {} as Record<K, string>);
}
