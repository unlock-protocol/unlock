import * as rtl from 'react-testing-library'
import React from 'react'

import {
  WalletServiceContext,
  WalletStateContext,
} from '../../../hooks/components/WalletService'
import useWalletService from '../../../hooks/web3/useWalletService'

describe('useWalletService hook', () => {
  const { Provider: WalletProvider } = WalletServiceContext
  const { Provider: StateProvider } = WalletStateContext

  const walletState = 'wallet state'
  function MockWalletUser() {
    const { wallet, state } = useWalletService()
    return (
      <div>
        <span>{wallet}</span>
        <span>{state}</span>
      </div>
    )
  }

  it('retrieves the wallet object from context', () => {
    const wrapper = rtl.render(
      <StateProvider value={walletState}>
        <WalletProvider value="wallet">
          <MockWalletUser />
        </WalletProvider>
      </StateProvider>
    )

    expect(wrapper.getByText('wallet')).not.toBeNull()
    expect(wrapper.getByText('wallet state')).not.toBeNull()
  })
})
