export function intoObject<K extends string | number | symbol, V>(
  obj: Record<K, V>,
  [k, v]: [K, V]
): Record<K, V> {
  obj[k] = v;
  return obj;
}
