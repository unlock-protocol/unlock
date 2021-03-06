import React from 'react'
import * as rtl from '@testing-library/react'
import { AccountInfo } from '../../../../components/interface/user-account/AccountInfo'

const emailAddress = 'geoff@bitconnect.gov'
const address = '0x123abc'

describe.skip('AccountInfo component', () => {
  it('should show the email and wallet addresses for a user account', () => {
    expect.assertions(0)
    const { getAllByText } = rtl.render(<AccountInfo />)

    getAllByText(emailAddress)
    getAllByText(address)
  })
})
