import request from 'supertest'
import * as sigUtil from 'eth-sig-util'
import * as ethJsUtil from 'ethereumjs-util'

import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')

const privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

const mockOnChainLockOwnership = {
  owner: jest.fn(() => {
    return Promise.resolve('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
  }),
}

const lockAddress = '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'
const owningAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

jest.mock('../../../src/utils/lockData', () => {
  return function() {
    return mockOnChainLockOwnership
  }
})

const mockKeyHoldersByLock = {
  getKeyHoldingAddresses: jest.fn(() => {
    return Promise.resolve([owningAddress])
  }),
}

jest.mock('../../../src/graphql/datasource/keyholdersByLock', () => ({
  __esModule: true,
  KeyHoldersByLock: jest.fn(() => {
    return mockKeyHoldersByLock
  }),
}))

function generateKeyTypedData(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      KeyMetadata: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'KeyMetadata',
    message,
  }
}

describe('when the signee owns the lock', () => {
  let typedData: any
  beforeAll(() => {
    typedData = generateKeyTypedData({
      KeyMetaData: {
        custom_field: 'custom value',
        owner: owningAddress,
      },
    })

    mockOnChainLockOwnership.owner = jest.fn(() => {
      return Promise.resolve(owningAddress)
    })
  })

  describe('when missing relevant signature details', () => {
    it('returns as unauthorized', async () => {
      expect.assertions(1)

      const response = await request(app)
        .put(`/api/key/${lockAddress}/5`)
        .set('Accept', 'json')
        .send(typedData)

      expect(response.status).toEqual(401)
    })
  })

  describe('when including signature details', () => {
    it('stores the provided key metadata', async () => {
      expect.assertions(1)

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
        from: '',
      })

      const response = await request(app)
        .put(`/api/key/${lockAddress}/5`)
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(202)
    })
  })
})
