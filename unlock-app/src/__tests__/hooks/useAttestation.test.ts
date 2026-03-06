import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockGetSigner = vi.fn()
const mockGetSchema = vi.fn()
const mockConnect = vi.fn()

vi.mock('ethers', () => ({
  BrowserProvider: vi.fn(() => ({
    getSigner: mockGetSigner,
  })),
}))

vi.mock('@ethereum-attestation-service/eas-sdk', () => ({
  SchemaRegistry: vi.fn(() => ({
    connect: mockConnect,
    getSchema: mockGetSchema,
  })),
}))

import getSchemaDataStructure from '../../hooks/useAttestation'

describe('getSchemaDataStructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    global.window = { ethereum: {} } as any

    mockGetSigner.mockResolvedValue({ address: '0xSigner' })
    mockGetSchema.mockResolvedValue({
      uid: '0xschema123',
      schema: 'string name',
    })
  })

  it('returns the schema record', async () => {
    const result = await getSchemaDataStructure('0xschema123')

    expect(result).toEqual({ uid: '0xschema123', schema: 'string name' })
  })
})
