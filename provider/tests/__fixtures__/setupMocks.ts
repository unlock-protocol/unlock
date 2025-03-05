import { vi } from 'vitest'

// Mock the rateLimit module
vi.mock('../../src/rateLimit', async () => {
  const actual = (await vi.importActual('../../src/rateLimit')) as any
  return {
    ...actual,
    checkRateLimit: vi.fn().mockResolvedValue(true),
    shouldRateLimit: vi.fn().mockResolvedValue(false),
    isUnlockContract: vi.fn().mockResolvedValue(false),
    getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
    shouldRateLimitSingle:
      actual.shouldRateLimitSingle || vi.fn().mockResolvedValue(false),
  }
})

// Mock the unlockContracts module functions
vi.mock('../../src/unlockContracts', async () => {
  return {
    isKnownUnlockContract: vi.fn().mockReturnValue(false),
    checkIsLock: vi.fn().mockResolvedValue(false),
  }
})

export default function setupGlobalMocks() {}
