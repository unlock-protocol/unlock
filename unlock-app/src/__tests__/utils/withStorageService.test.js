import React from 'react'
import * as rtl from '@testing-library/react'
import withStorageService, {
  StorageServiceContext,
} from '../../utils/withStorageService'

const StorageServiceProvider = StorageServiceContext.Provider

// todo: fix
describe.skip('withStorageService', () => {
  it('should return a component which has access to the storageService', () => {
    expect.assertions(1)
    // eslint-disable-next-line react/prop-types
    const Component = ({ storageService }) => {
      return (
        <p>
          {storageService
            ? 'has storage service'
            : 'does not have storage service'}
        </p>
      )
    }
    const ComponentWithStorageService = withStorageService(Component)

    const mockStorageService = {}
    const wrapper = rtl.render(
      <StorageServiceProvider value={mockStorageService}>
        <ComponentWithStorageService />
      </StorageServiceProvider>
    )
    expect(wrapper.getByText('has storage service')).not.toBeNull()
  })
})
