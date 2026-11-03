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

const makeContextProvider = (address: string, parentOrigin?: () => string) => ({
  parentOrigin,
  getNetwork: vi.fn().mockResolvedValue({ chainId: '8453' }),
  send: vi.fn(async (method: string) =>
    method === 'eth_accounts' ? [address] : undefined
  ),
})

// Context holds a provider for a different address than the authenticated
// account; WalletService must not be built from it.
let contextProvider = makeContextProvider(OTHER)

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    AuthenticationContext.Provider,
    { value: { account: AUTHENTICATED, setAccount: vi.fn() } },
    React.createElement(
      ProviderContext.Provider,
      { value: { provider: contextProvider, setProvider } },
      children
    )
  )

describe('useProvider', () => {
  beforeEach(() => {
    connectedWallets = []
    contextProvider = makeContextProvider(OTHER)
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

  it('uses the authenticated wallet when context manages another account', async () => {
    // The context provider does not manage the authenticated account.
    connectedWallets = [makeWallet(AUTHENTICATED)]

    const { result } = renderHook(() => useProvider(), { wrapper })
    await result.current.getWalletService(8453)

    const usedProvider = walletServiceConnect.mock.calls[0][0]
    expect(usedProvider.underlying).not.toEqual({ __address: OTHER })
    expect(usedProvider.underlying).toEqual({ __address: AUTHENTICATED })
    // And the context is refreshed for subsequent renders.
    expect(setProvider).toHaveBeenCalled()
  })

  it('prompts for the authenticated wallet and refuses the wrong one', async () => {
    connectedWallets = [makeWallet(OTHER)]

    const { result } = renderHook(() => useProvider(), { wrapper })

    await expect(result.current.getWalletService(8453)).rejects.toThrow(
      /Wrong wallet connected/
    )
    // WalletService must never be built from a provider for another account.
    expect(walletServiceConnect).not.toHaveBeenCalled()
    expect(connectWallet).toHaveBeenCalledWith({
      suggestedAddress: AUTHENTICATED,
    })
    expect(toastError).not.toHaveBeenCalled()
  })

  it('preserves a delegated provider when Privy has no connected wallet', async () => {
    contextProvider = makeContextProvider(
      OTHER,
      () => 'https://checkout.example.com'
    )

    const { result } = renderHook(() => useProvider(), { wrapper })
    await result.current.getWalletService(8453)

    expect(walletServiceConnect).toHaveBeenCalledWith(contextProvider)
    expect(connectWallet).not.toHaveBeenCalled()
    expect(setProvider).not.toHaveBeenCalled()
  })

  it('preserves a delegated provider when Privy also has the authenticated wallet', async () => {
    connectedWallets = [makeWallet(AUTHENTICATED)]
    contextProvider = makeContextProvider(
      OTHER,
      () => 'https://checkout.example.com'
    )

    const { result } = renderHook(() => useProvider(), { wrapper })
    await result.current.getWalletService(8453)

    expect(walletServiceConnect).toHaveBeenCalledWith(contextProvider)
    expect(setProvider).not.toHaveBeenCalled()
  })

  it('reuses a context provider whose default signer is authenticated', async () => {
    const wallet = makeWallet(AUTHENTICATED)
    connectedWallets = [wallet]
    contextProvider = makeContextProvider(AUTHENTICATED)

    const { result } = renderHook(() => useProvider(), { wrapper })
    await result.current.getWalletService(8453)

    expect(walletServiceConnect).toHaveBeenCalledWith(contextProvider)
    expect(wallet.getEthereumProvider).not.toHaveBeenCalled()
    expect(setProvider).not.toHaveBeenCalled()
  })

  it('watches an asset through the authenticated wallet provider', async () => {
    connectedWallets = [makeWallet(OTHER), makeWallet(AUTHENTICATED)]

    const { result } = renderHook(() => useProvider(), { wrapper })
    await result.current.watchAsset({
      address: '0xLock',
      network: 8453,
      tokenId: '42',
    })

    const activeProvider = setProvider.mock.calls[0][0]
    expect(contextProvider.send).toHaveBeenCalledTimes(1)
    expect(contextProvider.send).toHaveBeenCalledWith('eth_accounts', [])
    expect(activeProvider.send).toHaveBeenNthCalledWith(
      1,
      'wallet_switchEthereumChain',
      [{ chainId: '0x2105' }]
    )
    expect(activeProvider.send).toHaveBeenNthCalledWith(
      2,
      'wallet_watchAsset',
      {
        type: 'ERC721',
        options: { address: '0xLock', tokenId: '42' },
      }
    )
  })
})
