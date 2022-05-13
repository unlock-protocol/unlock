import React, { ReactNode, useContext } from 'react'
import { StorageService } from '~/services/storageService'

/**
 * Function which creates higher order component with an instance of storageService
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const StorageServiceContext = React.createContext<StorageService | null>(
  null
)

/**
 * This creates an HOC from a component and injects the storageService.
 * @param {*} Component
 */
export default function withStorageService(Component: any) {
  function componentWithStorageService(props: any) {
    return (
      <StorageServiceContext.Consumer>
        {(storageService) => (
          <Component {...props} storageService={storageService} />
        )}
      </StorageServiceContext.Consumer>
    )
  }

  return componentWithStorageService
}

export function useStorageService() {
  return useContext(StorageServiceContext)!
}
