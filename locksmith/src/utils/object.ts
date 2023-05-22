export function objectWithoutKey(obj: Record<string, unknown>, key: string) {
  const { [key]: deletedKey, ...otherKeys } = obj
  return otherKeys
}

export function lowercaseObjectKeys(obj: Record<string, unknown>) {
  const newObject: Record<string, any> = {}

  Object.keys(obj).forEach((key) => {
    newObject[key.toLowerCase()] = obj[key]
  })

  return newObject
}
