export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

export const getIconName = (name: string) => {
  let id = name.toLowerCase().trim()
  const regex = /^\d/
  if (regex.test(id)) {
    id = `I${id.toLowerCase()}`
  }
  return capitalize(id)
}
