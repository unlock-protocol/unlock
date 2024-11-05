import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Web3Service } from '@unlock-protocol/unlock-js'
import { CheckoutConfig } from '../../src/models'
import {
  deleteCheckoutConfigById,
  getCheckoutConfigById,
  saveCheckoutConfig,
} from '../../src/operations/checkoutConfigOperations'
import networks from '@unlock-protocol/networks'

// Mock the models
vi.mock('../../src/models', () => ({
  CheckoutConfig: {
    findOne: vi.fn(),
    upsert: vi.fn(),
    findAll: vi.fn(),
  },
}))

// Mock the networks package
vi.mock('@unlock-protocol/networks', () => ({
  default: {
    1: {
      provider: 'http://provider.test',
      unlockAddress: '0xunlock',
    },
  },
}))

// Mock Web3Service
vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: vi.fn().mockImplementation(() => ({
    isLockManager: vi.fn(),
  })),
}))

// Helper function to create mock CheckoutConfig instances
const createMockCheckoutConfig = (
  data: Partial<CheckoutConfig>
): CheckoutConfig => {
  const mock = {
    id: '',
    name: '',
    config: {},
    createdBy: '',
    updatedAt: new Date(),
    createdAt: new Date(),
    destroy: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    ...data,
    isNewRecord: false,
    sequelize: null,
    _model: null,
    dataValues: data,
    _previousDataValues: {},
    _changed: new Set(),
    _options: {},
    _attributes: null,
    _creationAttributes: null,
  } as unknown as CheckoutConfig

  return mock
}

describe('Checkout Config Operations', () => {
  const mockUser = '0xuser'
  const mockConfig = {
    network: 1,
    locks: {
      '0xlock': {
        network: 1,
      },
    },
  }

  let web3ServiceInstance: Web3Service

  beforeEach(() => {
    vi.clearAllMocks()
    web3ServiceInstance = new Web3Service(networks)
    web3ServiceInstance.isLockManager = vi.fn()
  })

  describe('saveCheckoutConfig', () => {
    it('should create a new config when id is not provided', async () => {
      const mockStoredConfig = createMockCheckoutConfig({
        id: 'new-id',
        name: 'Test Config',
        config: mockConfig,
        createdBy: mockUser,
        updatedAt: new Date(),
        createdAt: new Date(),
      })

      const findOneMock = vi.fn().mockResolvedValue(null)
      const upsertMock = vi.fn().mockResolvedValue([mockStoredConfig, true])

      CheckoutConfig.findOne = findOneMock
      CheckoutConfig.upsert = upsertMock

      const result = await saveCheckoutConfig({
        name: 'Test Config',
        user: mockUser,
        config: mockConfig,
      })

      expect(result).toEqual(mockStoredConfig)
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Config',
          config: mockConfig,
          createdBy: mockUser,
        }),
        expect.any(Object)
      )
    })

    it('should update existing config when authorized', async () => {
      const existingConfig = createMockCheckoutConfig({
        id: 'existing-id',
        name: 'Old Name',
        config: mockConfig,
        createdBy: mockUser,
        updatedAt: new Date(),
        createdAt: new Date(),
      })

      const updatedConfig = createMockCheckoutConfig({
        ...existingConfig,
        name: 'New Name',
        config: mockConfig,
      })

      CheckoutConfig.findOne = vi.fn().mockResolvedValue(existingConfig)
      CheckoutConfig.upsert = vi.fn().mockResolvedValue([updatedConfig, true])
      web3ServiceInstance.isLockManager = vi.fn().mockResolvedValue(true)

      const result = await saveCheckoutConfig({
        id: 'existing-id',
        name: 'New Name',
        user: mockUser,
        config: mockConfig,
      })

      expect(result.name).toBe('New Name')
      expect(result.createdBy).toBe(mockUser)
    })

    it('should throw error when user is not authorized to update', async () => {
      const existingConfig = createMockCheckoutConfig({
        id: 'existing-id',
        name: 'Old Name',
        config: mockConfig,
        createdBy: '0xotheruser',
        updatedAt: new Date(),
        createdAt: new Date(),
      })

      CheckoutConfig.findOne = vi.fn().mockResolvedValue(existingConfig)
      CheckoutConfig.upsert = vi.fn().mockResolvedValue([existingConfig, true])
      web3ServiceInstance.isLockManager = vi.fn().mockResolvedValue(false)

      await expect(
        saveCheckoutConfig({
          id: 'existing-id',
          name: 'New Name',
          user: mockUser,
          config: mockConfig,
        })
      ).rejects.toThrow('User not authorized to update this configuration')
    })
  })

  describe('getCheckoutConfigById', () => {
    it('should return null when config not found', async () => {
      CheckoutConfig.findOne = vi.fn().mockResolvedValue(null)

      const result = await getCheckoutConfigById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return config when found', async () => {
      const configData = {
        id: 'test-id',
        name: 'Test Config',
        config: {
          locks: {},
        },
        createdBy: mockUser,
        updatedAt: new Date(),
        createdAt: new Date(),
      }
      const mockConfig = createMockCheckoutConfig(configData)

      CheckoutConfig.findOne = vi.fn().mockResolvedValue(mockConfig)

      const result = await getCheckoutConfigById('test-id')
      expect(result).toMatchObject({
        id: 'test-id',
        name: 'Test Config',
        by: mockUser,
      })
    })
  })

  describe('deleteCheckoutConfigById', () => {
    it('should return false when config not found', async () => {
      CheckoutConfig.findOne = vi.fn().mockResolvedValue(null)

      const result = await deleteCheckoutConfigById(mockUser, 'non-existent-id')
      expect(result).toBe(false)
    })

    it('should delete config when user is authorized', async () => {
      const configData = {
        id: 'test-id',
        name: 'Test Config',
        config: {
          locks: {}, // Minimum required config
        },
        createdBy: mockUser,
        updatedAt: new Date(),
        createdAt: new Date(),
      }
      const mockConfig = createMockCheckoutConfig(configData)

      CheckoutConfig.findOne = vi.fn().mockResolvedValue(mockConfig)
      CheckoutConfig.upsert = vi.fn().mockResolvedValue([mockConfig, true])
      web3ServiceInstance.isLockManager = vi.fn().mockResolvedValue(true)

      const result = await deleteCheckoutConfigById(mockUser, 'test-id')
      expect(result).toBe(true)
      expect(mockConfig.destroy).toHaveBeenCalled()
    })
  })
})
