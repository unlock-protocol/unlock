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

function makeUser(walletAddress?: string) {
  return {
    wallet: walletAddress ? { address: walletAddress } : undefined,
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

  it('authenticates with Locksmith using user.wallet.address', async () => {
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

  it('returns null when user has no wallet and no override is provided', async () => {
    const user = makeUser() // no wallet
    const result = await onSignedInWithPrivy(user)

    expect(mockLoginWithPrivy).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('uses walletAddressOverride when user object is stale (no wallet after creation)', async () => {
    // This is the bug scenario: wallet was just created but user object is stale
    const staleUser = makeUser() // user object captured before wallet was created
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

  it('prefers user.wallet.address over walletAddressOverride when both are present', async () => {
    const overrideAddress = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'
    const user = makeUser(WALLET_ADDRESS)
    const result = await onSignedInWithPrivy(user, overrideAddress)

    expect(mockLoginWithPrivy).toHaveBeenCalledWith({
      accessToken: PRIVY_TOKEN,
      walletAddress: WALLET_ADDRESS,
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
})
