import Fuse from 'fuse.js'

export const searchFromList = <T>(
  items: Array<T>,
  searchTerm: string,
  keys?: string[]
) => {
  const options = {
    keys,
    // because we deal with wallet address let's keep threshold to 0 to have perfect match on search
    threshold: 0,
  }

  const fuse = new Fuse(items, options)

  return [...fuse.search(searchTerm).map(({ item }) => item)]
}
