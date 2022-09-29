export const asHtml = (string) => {
  const newNode = document.createElement('div')
  newNode.innerHTML = string
  return newNode
}
