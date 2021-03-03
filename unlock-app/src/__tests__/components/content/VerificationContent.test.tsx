import React from 'react'
import * as rtl from '@testing-library/react'
import { ConfigContext } from '../../../utils/withConfig'
import VerificationContent from '../../../components/content/VerificationContent'

function renderPage() {
  return rtl.render(
    <ConfigContext.Provider value={{}}>
      <VerificationContent />
    </ConfigContext.Provider>
  )
}

describe.skip('VerificationContent', () => {
  describe('render', () => {
    it('should be a page with the title "Verification"', () => {
      expect.assertions(0)
      const { getByText } = renderPage()

      getByText('Verification')
    })

    it('should show the account when there is an account in state', () => {
      expect.assertions(0)
      const { getByText } = renderPage()

      getByText('0xD6858301c9F434cCcDbFaB8E984bea08BbDBFDCE')
    })
  })
})
