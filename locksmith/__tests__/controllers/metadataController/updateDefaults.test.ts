import { ethers } from 'ethers'
import request from 'supertest'

const app = require('../../../src/app')
const Base64 = require('../../../src/utils/base64')

const wallet2 = new ethers.Wallet(
  '0xe5986c22698a3c1eb5f84455895ad6826fbdff7b82dbeee240bad0024469d93a'
)

const wallet = new ethers.Wallet(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

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
    return Promise.resolve(['0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'])
  }),
}

jest.mock('../../../src/graphql/datasource/keyholdersByLock', () => ({
  __esModule: true,
  KeyHoldersByLock: jest.fn(() => {
    return mockKeyHoldersByLock
  }),
}))

function generateTypedData(message: any, messageKey: string) {
  return {
    types: {
      LockMetadata: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'address', type: 'address' },
        { name: 'owner', type: 'address' },
        { name: 'image', type: 'string' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'LockMetadata',
    message,
    messageKey,
  }
}

describe('updateDefaults', () => {
  let typedData: any

  beforeAll(() => {
    typedData = generateTypedData(
      {
        LockMetaData: {
          name: 'An awesome Lock',
          description: 'we are chilling and such',
          address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          image: 'http://image.location.url',
        },
      },
      'LockMetaData'
    )
  })

  describe('when the signee does not own the lock', () => {
    beforeEach(() => {
      mockWeb3Service.isLockManager = jest.fn(() => Promise.resolve(false))
    })

    it('returns unauthorized', async () => {
      expect.assertions(1)

      const { domain, types, message } = typedData
      const sig = await wallet._signTypedData(
        domain,
        types,
        message['LockMetaData']
      )

      const response = await request(app)
        .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7')
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(401)
    })
  })

  describe('when the signee owns the lock', () => {
    beforeAll(() => {
      mockWeb3Service.isLockManager = jest.fn(() => Promise.resolve(true))
    })

    it('stores the provided lock metadata', async () => {
      expect.assertions(1)

      const { domain, types, message } = typedData
      const sig = await wallet._signTypedData(
        domain,
        types,
        message['LockMetaData']
      )

      const response = await request(app)
        .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7')
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(202)
    })

    describe('when signature does not match', () => {
      it('return an Unauthorized status code', async () => {
        expect.assertions(1)

        const { domain, types, message } = typedData
        const sig = await wallet2._signTypedData(
          domain,
          types,
          message['LockMetaData']
        )

        const response = await request(app)
          .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toEqual(401)
      })
    })
  })
})
