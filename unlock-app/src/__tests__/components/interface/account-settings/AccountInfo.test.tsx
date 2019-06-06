import React from 'react'
import * as rtl from 'react-testing-library'
import {
  AccountInfo,
  mapStateToProps,
} from '../../../../components/interface/account-settings/AccountInfo'

const email = 'geoff@bitconnect.gov'
const address = '0x123abc'

describe('AccountInfo component', () => {
  it('should show the email and wallet addresses for a user account', () => {
    expect.assertions(0)
    const { getAllByText } = rtl.render(
      <AccountInfo address={address} email={email} />
    )

    getAllByText(email)
    getAllByText(address)
  })

  describe('mapStateToProps', () => {
    it('should pass through the email and wallet addresses from state', () => {
      expect.assertions(1)
      const state = {
        userDetails: {
          email,
        },
        account: {
          address,
        },
      }

      expect(mapStateToProps(state)).toEqual({ address, email })
    })

    it('should provide default values if properties are not initialized in state', () => {
      expect.assertions(1)
      const state = {}

      expect(mapStateToProps(state)).toEqual({
        address: '',
        email: '',
      })
    })
  })
})
