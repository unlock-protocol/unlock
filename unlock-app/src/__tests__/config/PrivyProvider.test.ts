import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @privy-io/react-auth before importing the module under test
vi.mock('@privy-io/react-auth', () => ({
  getAccessToken: vi.fn(),
  PrivyProvider: vi.fn(),
  useLogin: vi.fn(),
  useCreateWallet: vi.fn(),
  usePrivy: vi.fn(),
}))

vi.mock('@unlock-protocol/ui', () => ({
  ToastHelper: { error: vi.fn() },
}))

vi.mock('~/config/locksmith', () => ({
  locksmith: {
    loginWithPrivy: vi.fn(),
    getUserAccountType: vi.fn(),
  },
}))

vi.mock('~/utils/session', () => ({
  saveAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
  removeCurrentAccount: vi.fn(),
}))

vi.mock('axios', () => ({
  isAxiosError: vi.fn().mockReturnValue(false),
}))

import { getAccessToken as privyGetAccessToken } from '@privy-io/react-auth'
import { locksmith } from '~/config/locksmith'
import { saveAccessToken } from '~/utils/session'
import { onSignedInWithPrivy } from '~/config/PrivyProvider'

const mockPrivyGetAccessToken = vi.mocked(privyGetAccessToken)
const mockLoginWithPrivy = vi.mocked(locksmith.loginWithPrivy)
const mockSaveAccessToken = vi.mocked(saveAccessToken)

const PRIVY_TOKEN = 'privy-access-token'
const LOCKSMITH_TOKEN = 'locksmith-access-token'
const WALLET_ADDRESS = '0x1234567890AbcdEF1234567890aBcdef12345678'
const SOLANA_ADDRESS = 'BgNcYPxA8GAdbUhS9ErgoTdLcHmsX2yz1mMqikNoYmnu'

function makeUser(
  walletAddress?: string,
  chainType: 'ethereum' | 'solana' = 'ethereum'
) {
  const linkedAccounts = walletAddress
    ? [{ type: 'wallet', address: walletAddress, chainType }]
    : []
  return {
    wallet: walletAddress ? { address: walletAddress } : undefined,
    linkedAccounts,
    email: undefined,
  } as any
}

describe('onSignedInWithPrivy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrivyGetAccessToken.mockResolvedValue(PRIVY_TOKEN)
    mockLoginWithPrivy.mockResolvedValue({
      data: { accessToken: LOCKSMITH_TOKEN },
    } as any)
  })

  it('authenticates with Locksmith using EVM wallet from linkedAccounts', async () => {
    const user = makeUser(WALLET_ADDRESS)
    const result = await onSignedInWithPrivy(user)

    expect(mockLoginWithPrivy).toHaveBeenCalledWith({
      accessToken: PRIVY_TOKEN,
      walletAddress: WALLET_ADDRESS,
    })
    expect(mockSaveAccessToken).toHaveBeenCalledWith({
      accessToken: LOCKSMITH_TOKEN,
      walletAddress: WALLET_ADDRESS,
    })
    expect(result).toBe(WALLET_ADDRESS)
  })

  it('returns null when user has no EVM wallet and no override is provided', async () => {
    const user = makeUser() // no wallet
    const result = await onSignedInWithPrivy(user)

    expect(mockLoginWithPrivy).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('uses walletAddressOverride when user has no EVM wallet in linkedAccounts', async () => {
    // Stale user object captured before EVM wallet was created
    const staleUser = makeUser()
    const result = await onSignedInWithPrivy(staleUser, WALLET_ADDRESS)

    expect(mockLoginWithPrivy).toHaveBeenCalledWith({
      accessToken: PRIVY_TOKEN,
      walletAddress: WALLET_ADDRESS,
    })
    expect(mockSaveAccessToken).toHaveBeenCalledWith({
      accessToken: LOCKSMITH_TOKEN,
      walletAddress: WALLET_ADDRESS,
    })
    expect(result).toBe(WALLET_ADDRESS)
  })

  it('uses EVM wallet from linkedAccounts, ignores walletAddressOverride', async () => {
    const overrideAddress = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'
    const user = makeUser(WALLET_ADDRESS) // has EVM wallet in linkedAccounts
    const result = await onSignedInWithPrivy(user, overrideAddress)

    expect(mockLoginWithPrivy).toHaveBeenCalledWith({
      accessToken: PRIVY_TOKEN,
      walletAddress: WALLET_ADDRESS, // linkedAccounts EVM wallet wins
    })
    expect(result).toBe(WALLET_ADDRESS)
  })

  it('skips Solana wallet and uses override instead', async () => {
    const user = makeUser(SOLANA_ADDRESS, 'solana') // only Solana in linkedAccounts
    const result = await onSignedInWithPrivy(user, WALLET_ADDRESS)

    expect(mockLoginWithPrivy).toHaveBeenCalledWith({
      accessToken: PRIVY_TOKEN,
      walletAddress: WALLET_ADDRESS, // override used since no EVM in linkedAccounts
    })
    expect(result).toBe(WALLET_ADDRESS)
  })

  it('returns null when Privy access token is missing', async () => {
    mockPrivyGetAccessToken.mockResolvedValue(null)
    const user = makeUser(WALLET_ADDRESS)
    const result = await onSignedInWithPrivy(user)

    expect(mockLoginWithPrivy).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('returns null when Locksmith returns no access token', async () => {
    mockLoginWithPrivy.mockResolvedValue({ data: {} } as any)
    const user = makeUser(WALLET_ADDRESS)
    const result = await onSignedInWithPrivy(user)

    expect(mockLoginWithPrivy).toHaveBeenCalled()
    expect(mockSaveAccessToken).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
