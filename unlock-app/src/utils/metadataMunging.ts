import { KeyMetadata } from '../unlockTypes'

export const generateColumns = (
  metadata: KeyMetadata[],
  startingColumns: string[] = [
    'lockName',
    'token',
    'keyholderAddress',
    'expiration',
  ]
): string[] => {
  // clone the passed array to avoid mutation
  const columns = startingColumns.slice()

  const columnSet: { [key: string]: boolean } = {}

  metadata.forEach((datum) => {
    Object.keys(datum).forEach((key) => {
      // Don't want to include the pre-ordered starting columns
      if (columns.indexOf(key) < 0) {
        columnSet[key] = true
      }
    })
  })

  const keys = Object.keys(columnSet)
  const newColumns = keys.sort((a: string, b: string) => {
    return a.toLowerCase().localeCompare(b.toLowerCase())
  })

  return [...columns, ...newColumns]
}
