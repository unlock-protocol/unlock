// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

const AUTHENTICATED = '0x374355b89D26325c4C4Cd96f99753b82fd64b2Bb'
const OTHER = '0x2268b701DdE76122ff70af751CafA39623799e49'

const makeWallet = (address: string) => ({
  address,
  getEthereumProvider: vi.fn().mockResolvedValue({ __address: address }),
})

// Wallets Privy reports as connected. Reassigned per test.
let connectedWallets: ReturnType<typeof makeWallet>[] = []
const connectWallet = vi.fn()

vi.mock('@privy-io/react-auth', () => ({
  useWallets: () => ({ wallets: connectedWallets }),
  // Must be callable with no arguments: passing callbacks reaches Privy
  // internals that require a surrounding PrivyProvider.
  useConnectWallet: () => ({ connectWallet }),
}))

const toastError = vi.fn<(message: string) => void>()
vi.mock('@unlock-protocol/ui', () => ({
  ToastHelper: {
    error: (message: string) => toastError(message),
    success: vi.fn(),
  },
}))

const walletServiceConnect = vi.fn().mockResolvedValue(1)
vi.mock('@unlock-protocol/unlock-js', () => ({
  WalletService: class {
    connect = walletServiceConnect
    getAccount = vi.fn().mockResolvedValue(AUTHENTICATED)
  },
}))

// Captures which underlying provider each BrowserProvider was built from, so
// assertions can tell the two wallets apart.
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: class {
      underlying: unknown
      constructor(underlying: unknown) {
        this.underlying = underlying
      }
      getNetwork = vi.fn().mockResolvedValue({ chainId: '8453' })
      send = vi.fn().mockResolvedValue(undefined)
    },
  },
}))

import { useProvider } from '~/hooks/useProvider'
import ProviderContext from '~/contexts/ProviderContext'
import AuthenticationContext from '~/contexts/AuthenticationContext'

const setProvider = vi.fn()

// The provider already in context — deliberately the *wrong* wallet, matching
// the state that produced the original bug.
const staleProvider = {
  underlying: { __address: OTHER },
  getNetwork: vi.fn().mockResolvedValue({ chainId: '8453' }),
  send: vi.fn().mockResolvedValue(undefined),
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    AuthenticationContext.Provider,
    { value: { account: AUTHENTICATED, setAccount: vi.fn() } },
    React.createElement(
      ProviderContext.Provider,
      { value: { provider: staleProvider, setProvider } },
      children
    )
  )

describe('useProvider', () => {
  beforeEach(() => {
    connectedWallets = []
    connectWallet.mockClear()
    toastError.mockClear()
    setProvider.mockClear()
    walletServiceConnect.mockClear()
  })

  it('picks the authenticated wallet by address, not by list position', async () => {
    // Authenticated wallet is present but NOT first: indexing wallets[0] would
    // pick the wrong one.
    connectedWallets = [makeWallet(OTHER), makeWallet(AUTHENTICATED)]

    const { result } = renderHook(() => useProvider(), { wrapper })
    await result.current.getWalletService(8453)

    expect(connectWallet).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()

    // The WalletService must be built from the authenticated wallet.
    const usedProvider = walletServiceConnect.mock.calls[0][0]
    expect(usedProvider.underlying).toEqual({ __address: AUTHENTICATED })
  })

  it('signs with the authenticated wallet, not the stale context provider', async () => {
    // Context still holds the previously-connected wrong wallet.
    connectedWallets = [makeWallet(AUTHENTICATED)]

    const { result } = renderHook(() => useProvider(), { wrapper })
    await result.current.getWalletService(8453)

    const usedProvider = walletServiceConnect.mock.calls[0][0]
    expect(usedProvider.underlying).not.toEqual({ __address: OTHER })
    expect(usedProvider.underlying).toEqual({ __address: AUTHENTICATED })
    // And the context is refreshed for subsequent renders.
    expect(setProvider).toHaveBeenCalled()
  })

  it('throws instead of proceeding when the wrong wallet is connected', async () => {
    connectedWallets = [makeWallet(OTHER)]

    const { result } = renderHook(() => useProvider(), { wrapper })

    await expect(result.current.getWalletService(8453)).rejects.toThrow(
      /Wrong wallet connected/
    )
    // Crucially, it must not have built a WalletService on the wrong account:
    // that is what surfaced as an unrelated contract revert.
    expect(walletServiceConnect).not.toHaveBeenCalled()
  })

  it('prompts for the authenticated address and names it in the error', async () => {
    connectedWallets = [makeWallet(OTHER)]

    const { result } = renderHook(() => useProvider(), { wrapper })

    await expect(result.current.getWalletService(8453)).rejects.toThrow(
      /Wrong wallet connected/
    )
    expect(connectWallet).toHaveBeenCalledWith({
      suggestedAddress: AUTHENTICATED,
    })
    expect(toastError).toHaveBeenCalledWith(
      expect.stringContaining(AUTHENTICATED)
    )
  })
})
