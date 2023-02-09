export const asHtml = (string: string) => {
  const newNode = document.createElement('div')
  newNode.innerHTML = string
  return newNode
}
