import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import DashboardContent from '../../../components/content/DashboardContent'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'
import configure from '../../../config'

const account = {
  address: '0x12345678',
  balance: '5',
}

const network = {
  name: 1984,
}

const config = configure()
const ConfigProvider = ConfigContext.Provider

describe('DashboardContent', () => {
  describe('create lock button', () => {
    let store
    let wrapper
    beforeEach(() => {
      store = createUnlockStore({
        account,
        network,
        lockFormStatus: {
          visible: false,
        },
      })

      wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider value={config}>
            <DashboardContent />
          </ConfigProvider>
        </Provider>
      )
    })

    it('should open the creator lock form when the create lock button is clicked', () => {
      expect.assertions(4)

      expect(wrapper.queryByValue('New Lock')).toBeNull()
      expect(wrapper.queryByText('Submit')).toBeNull()

      const createButton = wrapper.getByText('Create Lock')
      rtl.fireEvent.click(createButton)

      expect(wrapper.queryByValue('New Lock')).not.toBeNull()
      expect(wrapper.queryByText('Submit')).not.toBeNull()
    })

    it('should disappear when cancel button is clicked', () => {
      // This is really testing the behavior of the creator lock form...  But in
      // order to test it end-to-end, it has to happen at this level so we have
      // access to the button.
      expect.assertions(4)

      let createButton = wrapper.getByText('Create Lock')
      rtl.fireEvent.click(createButton)

      expect(wrapper.queryByValue('New Lock')).not.toBeNull()
      expect(wrapper.queryByText('Submit')).not.toBeNull()

      let cancelButton = wrapper.getByText('Cancel')
      rtl.fireEvent.click(cancelButton)

      expect(wrapper.queryByValue('New Lock')).toBeNull()
      expect(wrapper.queryByText('Submit')).toBeNull()
    })
  })
})
