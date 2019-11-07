import { KeyMetadata, ReduxMetadata, KeyholdersByLock } from '../unlockTypes'
import { expirationAsDate } from './durations'

export const mergeSingleDatum = (
  lock: any,
  key: any,
  dataFromRedux: ReduxMetadata
): KeyMetadata => {
  let metadatum: KeyMetadata = {
    lockName: lock.name,
    expiration: expirationAsDate(parseInt(key.expiration)),
    keyholderAddress: key.owner.address,
  }

  if (dataFromRedux[lock.address] && dataFromRedux[lock.address][key.keyId]) {
    const storedKeyMetadata = dataFromRedux[lock.address][key.keyId]
    // If there are collisions between the various metadata fields (from the
    // graph, and from the 2 possible fields from locksmith), they will be
    // overwritten by whichever value comes last
    if (storedKeyMetadata.protected) {
      metadatum = {
        ...metadatum,
        ...storedKeyMetadata.protected,
      }
    }
    if (storedKeyMetadata.public) {
      metadatum = {
        ...metadatum,
        ...storedKeyMetadata.public,
      }
    }
  }
  return metadatum
}

export const mergeKeyholderMetadata = (
  keyholdersByLock: KeyholdersByLock,
  dataFromRedux: ReduxMetadata
): KeyMetadata[] => {
  let metadata: KeyMetadata[] = []

  keyholdersByLock.locks.forEach(lock => {
    lock.keys.forEach(key => {
      const metadatum = mergeSingleDatum(lock, key, dataFromRedux)
      metadata.push(metadatum)
    })
  })

  return metadata
}

export const generateColumns = (
  metadata: KeyMetadata[],
  startingColumns: string[] = ['lockName', 'keyholderAddress', 'expiration']
): string[] => {
  // clone the passed array to avoid mutation
  let columns = startingColumns.slice()

  const columnSet: { [key: string]: boolean } = {}

  metadata.forEach(datum => {
    Object.keys(datum).forEach(key => {
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
