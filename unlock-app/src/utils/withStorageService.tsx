import React, { useContext } from 'react'
import { StorageService } from '~/services/storageService'

/**
 * Function which creates higher order component with an instance of storageService
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const StorageServiceContext = React.createContext<StorageService | null>(
  null
)

export function useStorageService() {
  return useContext(StorageServiceContext)!
}
