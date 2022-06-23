import { ethers } from 'ethers'
import request from 'supertest'
import { keyTypedData } from '../../test-helpers/typeDataGenerators'

import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')

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

// eslint-disable-next-line
var mockWeb3Service = {
  isLockManager: jest.fn(() => Promise.resolve(false)),
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

jest.mock('../../../src/graphql/datasource/keyholdersByLock', () => ({
  __esModule: true,
  KeyHoldersByLock: jest.fn(() => {
    return mockKeyHoldersByLock
  }),
}))

describe('updating address holder metadata', () => {
  it('stores the passed data', async () => {
    expect.assertions(1)
    const typedData = keyTypedData(
      {
        UserMetaData: {
          owner: keyHolder[0],
          data: {
            protected: {
              emailAddress: 'emailAddress@example.com',
            },
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
      .put(`/api/key/${lockAddress}/user/${keyHolder[0]}`)
      .set('Accept', 'json')
      .set('Authorization', `Bearer ${Base64.encode(sig)}`)
      .send(typedData)

    expect(response.status).toEqual(202)
  })

  it('should update existing data if it already exists', async () => {
    expect.assertions(1)

    const typedData = keyTypedData(
      {
        UserMetaData: {
          owner: keyHolder[0],
          data: {
            protected: {
              emailAddress: 'updatedEmailAddress@example.com',
            },
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
      .put(`/api/key/${lockAddress}/user/${keyHolder[0]}`)
      .set('Accept', 'json')
      .set('Authorization', `Bearer ${Base64.encode(sig)}`)
      .send(typedData)

    expect(response.status).toEqual(202)
  })

  describe('when an invalid signature is passed', () => {
    it('returns unauthorized', async () => {
      expect.assertions(1)

      const typedData = keyTypedData(
        {
          UserMetaData: {
            owner: keyHolder[0],
            protected: {
              data: {
                emailAddress: 'updatedEmailAddress@example.com',
              },
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
        .put(`/api/key/${lockAddress}/user/${keyHolder[1]}`)
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(401)
    })
  })
})
