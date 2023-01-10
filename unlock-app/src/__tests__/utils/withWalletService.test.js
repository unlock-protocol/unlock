import React from 'react'
import * as rtl from '@testing-library/react'
import withWalletService, {
  WalletServiceContext,
} from '../../utils/withWalletService'

const WalletServiceProvider = WalletServiceContext.Provider

// todo: fix
describe.skip('withWalletService', () => {
  it('should return a component which has access to the walletService', () => {
    expect.assertions(1)
    // eslint-disable-next-line react/prop-types
    const Component = ({ walletService }) => {
      return (
        <p>
          {walletService
            ? 'has wallet service'
            : 'does not have wallet service'}
        </p>
      )
    }
    const ComponentWithWalletService = withWalletService(Component)
    const mockWalletService = {}
    const wrapper = rtl.render(
      <WalletServiceProvider value={mockWalletService}>
        <ComponentWithWalletService />
      </WalletServiceProvider>
    )
    expect(wrapper.getByText('has wallet service')).not.toBeNull()
  })
})
