import request from 'supertest'
import app from '../../app'
import { vi, expect, describe, it, beforeEach } from 'vitest'
import { uploadJsonToS3 } from '../../../src/utils/s3'

// Mock S3 upload function
vi.mock('../../../src/utils/s3', () => ({
  uploadJsonToS3: vi.fn(() => Promise.resolve()),
}))

describe('Merkle Tree Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createMerkleTree endpoint', () => {
    it('should create a merkle tree from an array of addresses with default amount of 1', async () => {
      const addresses = [
        '0x1234567890123456789012345678901234567890',
        '0x2234567890123456789012345678901234567890',
      ]

      const response = await request(app)
        .post('/v2/merkle-tree')
        .send(addresses)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('root')
      expect(typeof response.body.root).toBe('string')

      // Verify S3 upload was called with correct parameters
      expect(uploadJsonToS3).toHaveBeenCalledTimes(1)
      expect(uploadJsonToS3).toHaveBeenCalledWith(
        expect.any(String), // bucket name
        `${response.body.root}.json`,
        expect.any(Object) // tree data
      )
    })

    it('should create a merkle tree from an array of [address, amount] tuples', async () => {
      const entries = [
        ['0x1234567890123456789012345678901234567890', '100'],
        ['0x2234567890123456789012345678901234567890', '200'],
      ]

      const response = await request(app).post('/v2/merkle-tree').send(entries)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('root')
      expect(typeof response.body.root).toBe('string')
    })

    it('should handle numeric amounts by converting them to strings', async () => {
      const entries = [
        ['0x1234567890123456789012345678901234567890', 100],
        ['0x2234567890123456789012345678901234567890', 200],
      ]

      const response = await request(app).post('/v2/merkle-tree').send(entries)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('root')
    })

    it('should reject mixed entry types', async () => {
      const entries = [
        '0x1234567890123456789012345678901234567890',
        ['0x2234567890123456789012345678901234567890', '200'],
      ]

      const response = await request(app).post('/v2/merkle-tree').send(entries)

      expect(response.status).toBe(400)
      expect(response.headers['content-type']).toMatch(/json/)
      expect(response.body).toEqual({
        error: {
          issues: [
            {
              code: 'custom',
              message:
                'All entries must be of the same type: either simple recipient strings or [recipient, amount] tuples. Empty arrays are not allowed.',
              path: [],
            },
          ],
        },
      })
    })

    it('should reject empty arrays', async () => {
      const response = await request(app).post('/v2/merkle-tree').send([])

      expect(response.status).toBe(400)
      expect(response.headers['content-type']).toMatch(/json/)
      expect(response.body).toEqual({
        error: {
          issues: expect.arrayContaining([
            expect.objectContaining({
              message: expect.stringContaining('Empty arrays are not allowed'),
            }),
          ]),
        },
      })
    })

    it('should reject invalid addresses', async () => {
      const entries = [
        ['invalid-address', '100'],
        ['0x2234567890123456789012345678901234567890', '200'],
      ]

      const response = await request(app).post('/v2/merkle-tree').send(entries)

      expect(response.status).toBe(400)
    })

    it('should reject invalid amounts', async () => {
      const entries = [
        ['0x1234567890123456789012345678901234567890', 'invalid-amount'],
        ['0x2234567890123456789012345678901234567890', '200'],
      ]

      const response = await request(app).post('/v2/merkle-tree').send(entries)

      expect(response.status).toBe(400)
    })
  })
})
