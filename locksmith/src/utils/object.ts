export function objectWithoutKey(obj: Record<string, unknown>, key: string) {
  const { [key]: deletedKey, ...otherKeys } = obj
  return otherKeys
}
