import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import { ConfigContext } from '../../../utils/withConfig'
import createUnlockStore from '../../../createUnlockStore'
import VerificationContent from '../../../components/content/VerificationContent'

function renderPage(storeValues?: { [key: string]: any }) {
  return rtl.render(
    <Provider store={createUnlockStore(storeValues || {})}>
      <ConfigContext.Provider value={{}}>
        <VerificationContent />
      </ConfigContext.Provider>
    </Provider>
  )
}

describe('VerificationContent', () => {
  describe('render', () => {
    it('should be a page with the title "Verification"', () => {
      expect.assertions(0)
      const { getByText } = renderPage()

      getByText('Verification')
    })

    it('should show the account when there is an account in state', () => {
      expect.assertions(0)
      const { getByText } = renderPage({
        account: {
          address: '0xD6858301c9F434cCcDbFaB8E984bea08BbDBFDCE',
        },
      })

      getByText('0xD6858301c9F434cCcDbFaB8E984bea08BbDBFDCE')
    })
  })
})
