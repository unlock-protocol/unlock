export const protectedAttributes = [
  'replyTo',
  'promoCodes',
  'passwords',
  'allowList',
  'notifyCheckInUrls',
]

export const removeProtectedAttributesFromObject = (obj: any) => {
  const newObject = {
    ...obj,
  }
  protectedAttributes.forEach((attr) => {
    delete newObject[attr]
  })
  return newObject
}
