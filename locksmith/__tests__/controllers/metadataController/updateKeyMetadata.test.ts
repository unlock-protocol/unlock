import { ethers } from 'ethers'
import request from 'supertest'
import { keyTypedData } from '../../test-helpers/typeDataGenerators'
import * as Base64 from '../../../src/utils/base64'
const app = require('../../../src/app')

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

describe('updateKeyMetadata', () => {
  describe('when the signee does not own the lock', () => {
    let typedData: any
    beforeAll(() => {
      typedData = keyTypedData(
        {
          KeyMetaData: {
            custom_field: 'custom value',
            owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          },
        },
        'KeyMetaData'
      )

      mockWeb3Service.isLockManager = jest.fn(() => Promise.resolve(false))
    })

    it('returns unauthorized', async () => {
      expect.assertions(1)

      const { domain, types, message } = typedData
      const sig = await wallet._signTypedData(
        domain,
        types,
        message['KeyMetaData']
      )

      const response = await request(app)
        .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/5')
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(401)
    })
  })
})
