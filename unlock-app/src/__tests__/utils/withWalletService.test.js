import React from 'react'
import withWalletService from '../../utils/withWalletService'

describe('withWalletService', () => {
  it('should return a component which has access to the walletService', () => {
    expect.assertions(1)
    const component = ({ walletService }) => {
      return <>My Component</>
    }
    const componentWithWalletService = withWalletService(component)
  })
})
