export const protectedAttributes = ['replyTo', 'promoCodes', 'passwords']

export const removeProtectedAttributesFromObject = (obj: any) => {
  console.log(obj)
  const newObject = {
    ...obj,
  }
  protectedAttributes.forEach((attr) => {
    console.log(`REMOVE ${attr}`)
    delete newObject[attr]
  })
  console.log(newObject)
  return newObject
}
