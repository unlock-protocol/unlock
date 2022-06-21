import { ethers } from 'ethers'
import request from 'supertest'
import { keyTypedData } from '../../test-helpers/typeDataGenerators'

import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')

const wallet = new ethers.Wallet(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

const lockAddress = '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'
const owningAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

// eslint-disable-next-line
var mockWeb3Service = {
  isLockManager: jest.fn(() => Promise.resolve(false)),
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

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

let typedData: any
beforeAll(() => {
  typedData = keyTypedData({
    KeyMetaData: {
      custom_field: 'custom value',
      owner: owningAddress,
    },
  })

  mockWeb3Service.isLockManager = jest.fn(() => Promise.resolve(false))
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

describe('When the signee is the Lock owner', () => {
  describe('when including signature details', () => {
    it('stores the provided key metadata', async () => {
      expect.assertions(1)

      const { domain, types, message } = typedData
      const sig = await wallet._signTypedData(domain, types, message)

      mockWeb3Service.isLockManager = jest.fn(() => Promise.resolve(true))
      const response = await request(app)
        .put(`/api/key/${lockAddress}/5`)
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(202)
    })
  })
})
