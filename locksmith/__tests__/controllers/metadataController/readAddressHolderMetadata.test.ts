import { ethers } from 'ethers'
import request from 'supertest'
import { keyTypedData } from '../../test-helpers/typeDataGenerators'
import { addMetadata } from '../../../src/operations/userMetadataOperations'

import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')

const chain = 31337

const keyHolder = [
  '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
  '0x6f7a54d6629b7416e17fc472b4003ae8ef18ef4c',
]
const lockAddress = '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'
const wallet = new ethers.Wallet(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

const mockKeyHoldersByLock = {
  getKeyHoldingAddresses: jest.fn(() => {
    return Promise.resolve([keyHolder[0]])
  }),
}

jest.mock('../../../src/graphql/datasource/keyholdersByLock', () => ({
  __esModule: true,
  KeyHoldersByLock: jest.fn(() => {
    return mockKeyHoldersByLock
  }),
}))

describe('reading address holder metadata', () => {
  beforeAll(async () => {
    await addMetadata({
      chain,
      tokenAddress: lockAddress,
      userAddress: keyHolder[0],
      data: {
        protected: {
          hidden: 'metadata',
        },
        public: {
          mock: 'values',
        },
      },
    })
  })

  it('yields the stored passed data if the timestamp is recent', async () => {
    expect.assertions(2)
    const typedData = keyTypedData(
      {
        UserMetaData: {
          owner: keyHolder[0],
          timestamp: Date.now(),
        },
      },
      'UserMetaData'
    )

    const { domain, types, message } = typedData
    const sig = await wallet._signTypedData(
      domain,
      types,
      message['UserMetaData']
    )

    const response = await request(app)
      .get(`/api/key/${lockAddress}/user/${keyHolder[0]}`)
      .set('Accept', 'json')
      .set('Authorization', `Bearer ${Base64.encode(sig)}`)
      .query({ data: encodeURIComponent(JSON.stringify(typedData)) })

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
      userMetadata: {
        protected: {
          hidden: 'metadata',
        },
        public: {
          mock: 'values',
        },
      },
    })
  })

  it('does not yield the stored passed data if the timestamp is old', async () => {
    expect.assertions(2)
    const typedData = keyTypedData(
      {
        UserMetaData: {
          owner: keyHolder[0],
          timestamp: 0,
        },
      },
      'UserMetaData'
    )

    const { domain, types, message } = typedData
    const sig = await wallet._signTypedData(
      domain,
      types,
      message['UserMetaData']
    )

    const response = await request(app)
      .get(`/api/key/${lockAddress}/user/${keyHolder[0]}`)
      .set('Accept', 'json')
      .set('Authorization', `Bearer ${Base64.encode(sig)}`)
      .query({ data: encodeURIComponent(JSON.stringify(typedData)) })

    expect(response.status).toEqual(401)
    expect(response.body).toEqual({})
  })

  describe('when an invalid signature is passed', () => {
    it('returns unauthorized', async () => {
      expect.assertions(2)

      const typedData = keyTypedData(
        {
          UserMetaData: {
            owner: keyHolder[0],
            protected: {
              hidden: 'metadata',
            },
            public: {
              mock: 'values',
            },
          },
        },
        'UserMetaData'
      )

      const { domain, types, message } = typedData
      const sig = await wallet._signTypedData(
        domain,
        types,
        message['UserMetaData']
      )

      const response = await request(app)
        .get(`/api/key/${lockAddress}/user/${keyHolder[0]}`)
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .query({ data: encodeURIComponent(JSON.stringify(typedData)) })

      expect(response.status).toEqual(401)
      expect(response.body).toEqual({})
    })
  })
})
