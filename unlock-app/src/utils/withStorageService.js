import React from 'react'

/**
 * Function which creates higher order component with an instance of storageService
 * Taken from https://reactjs.org/docs/context.html#consuming-context-with-a-hoc
 */

export const StorageServiceContext = React.createContext()

/**
 * This creates an HOC from a component and injects the storageService.
 * @param {*} Component
 */
export default function withStorageService(Component) {
  function componentWithStorageService(props) {
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
