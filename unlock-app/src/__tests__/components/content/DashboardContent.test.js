import React from 'react'
import * as rtl from '@testing-library/react'
import DashboardContent from '../../../components/content/DashboardContent'
import { ConfigContext } from '../../../utils/withConfig'
import configure from '../../../config'

const account = {
  address: '0x12345678',
  balance: '5',
}

const network = {
  name: 1337,
}

const mockProvider = { loading: false, provider: {} }

jest.mock('../../../hooks/useProvider.ts', () => {
  return {
    useProvider: jest.fn(() => mockProvider),
  }
})

jest.mock('../../../hooks/useLocks', () => {
  return {
    useLocks: jest.fn(() => [false, []]),
  }
})
const config = configure()
const ConfigProvider = ConfigContext.Provider

describe('DashboardContent', () => {
  describe('create lock button', () => {
    let store
    let wrapper
    beforeEach(() => {
      wrapper = rtl.render(
        <ConfigProvider value={config}>
          <DashboardContent />
        </ConfigProvider>
      )
    })

    it.skip('should open the creator lock form when the create lock button is clicked', () => {
      expect.assertions(2)

      expect(wrapper.queryByDisplayValue('New Lock')).toBeNull()
      expect(wrapper.queryByText('Submit')).toBeNull()

      const createButton = wrapper.getByText('Create Lock')
      rtl.fireEvent.click(createButton)

      wrapper.getByDisplayValue('New Lock')
      wrapper.getByText('Submit')
    })

    it.skip('should disappear when cancel button is clicked', () => {
      // This is really testing the behavior of the creator lock form...  But in
      // order to test it end-to-end, it has to happen at this level so we have
      // access to the button.
      expect.assertions(2)

      const createButton = wrapper.getByText('Create Lock')
      rtl.fireEvent.click(createButton)

      wrapper.getByDisplayValue('New Lock')
      wrapper.getByText('Submit')

      const cancelButton = wrapper.getByText('Cancel')
      rtl.fireEvent.click(cancelButton)

      expect(wrapper.queryByDisplayValue('New Lock')).toBeNull()
      expect(wrapper.queryByText('Submit')).toBeNull()
    })
  })
})
