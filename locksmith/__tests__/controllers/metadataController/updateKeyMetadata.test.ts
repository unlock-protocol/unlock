import request from 'supertest'
import * as sigUtil from 'eth-sig-util'
import * as ethJsUtil from 'ethereumjs-util'
import { keyTypedData } from '../../test-helpers/typeDataGenerators'

import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')

const privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

const mockWeb3Service = {
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

describe('updateKeyMetadata', () => {
  describe('when the signee does not own the lock', () => {
    let typedData: any
    beforeAll(() => {
      typedData = keyTypedData({
        KeyMetaData: {
          custom_field: 'custom value',
          owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        },
      })

      mockWeb3Service.isLockManager = jest.fn(() => Promise.resolve(false))
    })

    it('returns unauthorized', async () => {
      expect.assertions(1)

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      const response = await request(app)
        .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/5')
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(401)
    })
  })
})
