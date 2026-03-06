import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockGetSigner = vi.fn()
const mockGetSchema = vi.fn()
const mockConnect = vi.fn()

// Mock all external dependencies before importing the module under test
vi.mock('ethers', () => ({
  BrowserProvider: vi.fn(function () {
    return { getSigner: mockGetSigner }
  }),
}))

vi.mock('@ethereum-attestation-service/eas-sdk', () => ({
  SchemaRegistry: vi.fn(function () {
    return { connect: mockConnect, getSchema: mockGetSchema }
  }),
  EAS: vi.fn(function () {
    return {}
  }),
  SchemaEncoder: vi.fn(function () {
    return {}
  }),
  NO_EXPIRATION: 0n,
}))

vi.mock('@unlock-protocol/networks', () => ({
  networks: {
    84532: {
      eas: {
        schemaRegistry: '0xSchemaRegistryAddress',
      },
    },
  },
  baseSepolia: {},
  base: {},
}))

vi.mock('~/utils/parseEasSchema', () => ({
  transformDataToEas: vi.fn(),
}))

vi.mock('~/config/locksmith', () => ({
  locksmithClient: { post: vi.fn() },
}))

vi.mock('~/config/app', () => ({
  config: { locksmithHost: 'http://localhost:8080' },
}))

import getSchemaDataStructure from '../../hooks/useAttestation'

describe('getSchemaDataStructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(window as any).ethereum = {}

    mockGetSigner.mockResolvedValue({ address: '0xSigner' })
    mockGetSchema.mockResolvedValue({
      uid: '0xschema123',
      schema: 'string name',
    })
  })

  it('returns the schema record', async () => {
    const result = await getSchemaDataStructure('0xschema123', 84532)

    expect(result).toEqual('string name')
  })
})
