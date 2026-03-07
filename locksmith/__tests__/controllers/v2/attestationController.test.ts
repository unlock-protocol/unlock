import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import app from '../../app'
import { expect, vi, beforeEach, describe, it } from 'vitest'
import { Attestation } from '../../../src/models/attestation'

const lockAddress = '0x62CcB13A72E6F991dE53b9B7AC42885151588Cd2'
const lockManager = '0x00192Fb10dF37c9FB26829eb2CC623cd1BF599E8'
const network = 84532 // Base Sepolia

const attestationData = {
  tokenId: '0x1234567890AbcdEF1234567890aBcdef12345678',
  schemaId:
    '0x3a9923db8a119d3bd312ca18781631c2f96fe5d31e67b437eb919148bfd84be6',
  attestationId:
    '0xabc123def456789012345678901234567890123456789012345678901234567890',
  data: {
    firstName: 'John',
    lastName: 'Doe',
  },
}

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string, manager: string) => {
          return (
            lockAddress.toLowerCase() === lock.toLowerCase() &&
            manager.toLowerCase() === lockManager.toLowerCase()
          )
        },
      }
    }),
    SubgraphService: vi.fn().mockImplementation(() => {
      return {
        lock: () => ({
          name: 'Test Lock',
          address: lockAddress,
        }),
      }
    }),
  }
})

describe('Attestation Controller v2', () => {
  beforeEach(async () => {
    fetchMock.resetMocks()
    // Clean up attestations before each test
    await Attestation.destroy({ where: {} })
  })

  describe('POST /v2/attestations/:network/:lockAddress', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .send(attestationData)

      expect(response.status).toBe(401)
    })

    it('should return 403 when user is not lock manager', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const response = await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(attestationData)

      expect(response.status).toBe(403)
    })

    it('should create attestation when user is lock manager', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      // Mock the isLockManager to return true for this user
      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      // Use unique attestationId for this test
      const uniqueAttestationData = {
        ...attestationData,
        attestationId: `0x${Date.now().toString(16)}${'0'.repeat(48)}`,
      }

      const response = await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(uniqueAttestationData)

      // Accept both 200 (upsert) and 201 (create) as success
      expect([200, 201]).toContain(response.status)
      expect(response.body.lockAddress.toLowerCase()).toBe(
        lockAddress.toLowerCase()
      )
      expect(response.body.network).toBe(network)
      expect(response.body.tokenId).toBe(uniqueAttestationData.tokenId)
      expect(response.body.schemaId).toBe(uniqueAttestationData.schemaId)
      expect(response.body.attestationId).toBe(
        uniqueAttestationData.attestationId
      )
      expect(response.body.data).toEqual(uniqueAttestationData.data)
    })

    it('should return 500 when validation fails', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      const invalidData = {
        // Missing required fields
        data: { firstName: 'John' },
      }

      const response = await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(invalidData)

      expect(response.status).toBe(500)
    })
  })

  describe('GET /v2/attestations/:network/:lockAddress', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get(
        `/v2/attestations/${network}/${lockAddress}`
      )

      expect(response.status).toBe(401)
    })

    it('should return empty array when no attestations exist', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      const response = await request(app)
        .get(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('should return attestations for the lock', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      // Create an attestation first
      await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(attestationData)

      const response = await request(app)
        .get(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].attestationId).toBe(attestationData.attestationId)
    })
  })

  describe('GET /v2/attestations/:network/:lockAddress/:attestationId', () => {
    it('should return 404 when attestation does not exist', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      const response = await request(app)
        .get(
          `/v2/attestations/${network}/${lockAddress}/0x0000000000000000000000000000000000000000000000000000000000000000`
        )
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(404)
    })

    it('should return attestation when it exists', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      // Create an attestation first
      await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(attestationData)

      const response = await request(app)
        .get(
          `/v2/attestations/${network}/${lockAddress}/${attestationData.attestationId}`
        )
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.attestationId).toBe(attestationData.attestationId)
      expect(response.body.data).toEqual(attestationData.data)
    })
  })

  describe('GET /v2/attestations/:network/:lockAddress/token/:tokenId', () => {
    it('should return attestations by tokenId', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      // Create an attestation first
      await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(attestationData)

      const response = await request(app)
        .get(
          `/v2/attestations/${network}/${lockAddress}/token/${attestationData.tokenId}`
        )
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].tokenId).toBe(attestationData.tokenId)
    })

    it('should return empty array when no attestations for tokenId', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      const response = await request(app)
        .get(`/v2/attestations/${network}/${lockAddress}/token/nonexistent`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })
  })

  describe('Upsert behavior', () => {
    it('should update existing attestation on duplicate attestationId', async () => {
      const { loginResponse } = await loginRandomUser(app)
      expect(loginResponse.status).toBe(200)

      const { Web3Service } = await import('@unlock-protocol/unlock-js')
      vi.mocked(Web3Service).mockImplementation(
        () =>
          ({
            isLockManager: () => true,
          }) as any
      )

      // Use unique attestationId for this test
      const uniqueAttestationId = `0x${Date.now().toString(16)}${'1'.repeat(48)}`
      const uniqueAttestationData = {
        ...attestationData,
        attestationId: uniqueAttestationId,
      }

      // Create initial attestation
      const createResponse = await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(uniqueAttestationData)

      // Accept both 200 (upsert) and 201 (create) as success for initial creation
      expect([200, 201]).toContain(createResponse.status)

      // Update with same attestationId but different data
      const updatedData = {
        ...uniqueAttestationData,
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      }

      const updateResponse = await request(app)
        .post(`/v2/attestations/${network}/${lockAddress}`)
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send(updatedData)

      expect(updateResponse.status).toBe(200)
      expect(updateResponse.body.data).toEqual(updatedData.data)

      // Verify only one attestation exists with this attestationId
      const getResponse = await request(app)
        .get(
          `/v2/attestations/${network}/${lockAddress}/${uniqueAttestationId}`
        )
        .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

      expect(getResponse.status).toBe(200)
      expect(getResponse.body.data).toEqual(updatedData.data)
    })
  })
})
