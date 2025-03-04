import { vi } from 'vitest'

// Disable automatic restore between tests to allow tests to control mock behavior
vi.mock('../../src/rateLimit', async () => {
  const actual = (await vi.importActual('../../src/rateLimit')) as any
  return {
    ...actual,
    checkRateLimit: vi.fn().mockResolvedValue(true),
    getContractAddress: vi.fn().mockReturnValue(null),
    isUnlockContract: vi.fn().mockResolvedValue(false),
    getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
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
