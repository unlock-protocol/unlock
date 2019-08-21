import request from 'supertest'
import * as sigUtil from 'eth-sig-util'
import * as ethJsUtil from 'ethereumjs-util'
import { LockMetadata } from '../../src/models/lockMetadata'

const app = require('../../src/app')
const Base64 = require('../../src/utils/base64')

let privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

let privateKey2 = ethJsUtil.toBuffer(
  '0xbbabdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

function generateTypedData(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      LockMetadata: [
        { name: 'address', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'image', type: 'string' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'LockMetadata',
    message: message,
  }
}

describe('Metadata Controller', () => {
  afterEach(async () => {
    await LockMetadata.truncate()
  })
  describe('the data stub', () => {
    it('returns wellformed stub data', async () => {
      expect.assertions(2)

      let response = await request(app)
        .get('/api/key/0x5543625f4581af4754204e452e72a65708708bc2/1')
        .set('Accept', 'json')

      expect(response.status).toBe(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          image: expect.any(String),
          name: expect.any(String),
        })
      )
    })

    it('returns wellformed data for Week in Ethereum News', async () => {
      expect.assertions(2)

      let response = await request(app)
        .get('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/1')
        .set('Accept', 'json')

      expect(response.status).toBe(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          description:
            "A Key to the 'Week in Ethereum News' lock. Unlock is a protocol for memberships. https://unlock-protocol.com/",
          image:
            'https://assets.unlock-protocol.com/nft-images/week-in-ethereum.png',
          name: 'Unlock Key to Week in Ethereum News',
        })
      )
    })
  })

  describe('updateDefaults', () => {
    it('stores the provided lock metadata', async () => {
      expect.assertions(1)

      let typedData = generateTypedData({
        LockMetaData: {
          name: 'An awesome Lock',
          description: 'we are chilling and such',
          address: '0x95de5F777A3e283bFf0c47374998E10D8A2183C7',
          owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          image: 'http://image.location.url',
        },
      })

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      let response = await request(app)
        .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7')
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(202)
    })

    describe('when signature does not match', () => {
      it('return an Unauthorized status code', async () => {
        expect.assertions(1)

        let typedData = generateTypedData({
          LockMetaData: {
            name: 'An awesome Lock',
            description: 'we are chilling and such',
            address: '0x95de5F777A3e283bFf0c47374998E10D8A2183C7',
            owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
            image: 'http://image.location.url',
          },
        })

        const sig = sigUtil.signTypedData(privateKey2, {
          data: typedData,
        })

        let response = await request(app)
          .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toEqual(401)
      })
    })
  })
})
