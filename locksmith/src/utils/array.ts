/**
 * Split array into chunks
 * @param items list of items
 * @param size size of chunks
 * @returns
 */
export const arrayToChunks = (items: any[], size: number) => {
  const res = []
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size)
    res.push(chunk)
  }
  return res
}
