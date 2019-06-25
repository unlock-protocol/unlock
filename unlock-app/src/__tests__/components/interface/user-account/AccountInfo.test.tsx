import React from 'react'
import * as rtl from 'react-testing-library'
import {
  AccountInfo,
  mapStateToProps,
} from '../../../../components/interface/user-account/AccountInfo'

const emailAddress = 'geoff@bitconnect.gov'
const address = '0x123abc'

describe('AccountInfo component', () => {
  it('should show the email and wallet addresses for a user account', () => {
    expect.assertions(0)
    const { getAllByText } = rtl.render(
      <AccountInfo address={address} emailAddress={emailAddress} />
    )

    getAllByText(emailAddress)
    getAllByText(address)
  })

  describe('mapStateToProps', () => {
    it('should pass through the email and wallet addresses from state', () => {
      expect.assertions(1)
      const state = {
        account: {
          address,
          emailAddress,
        },
      }

      expect(mapStateToProps(state)).toEqual({ address, emailAddress })
    })
  })
})
