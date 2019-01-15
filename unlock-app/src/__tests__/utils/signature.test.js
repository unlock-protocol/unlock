import EventEmitter from 'events'
import generateJWTToken from '../../utils/signature'
import Web3Service from '../../services/web3Service'
import configure from '../../config'

const signatureData = require('./fixtures/signatureData')

class MockWebService extends EventEmitter {
  constructor() {
    super()
    this.ready = true
  }
}

let mockWeb3Service = new MockWebService()

jest.mock('../../services/web3Service', () => {
  return function() {
    return mockWeb3Service
  }
})

const { providers } = configure(global)

describe('generateJWTToken', () => {
  describe('when authorized to sign the payload', () => {
    beforeEach(() => {
      const validSignature =
        '0xd64fd442c30596b2861f60d8e55207aa239df32303689463ea4f5' +
        'ab48ee9c4992eb6db40d8f8c5b568413f3963edfdb708ed788369c87' +
        'fc93b1aca95222e54e401'

      mockWeb3Service.signData = jest.fn((account, data, callback) => {
        callback(null, validSignature)
      })
    })

    it('generates a JWT signed by the address holder', done => {
      Date.now = jest.fn(() => 1546219627000)
      let web3Service = new Web3Service(providers)

      generateJWTToken(
        web3Service,
        signatureData.valid.address,
        signatureData.valid.data
      ).then(result => {
        expect(result).toBe(signatureData.valid.signature)
        done()
      })
    })
  })

  describe('when unauthorized to sign the payload', () => {
    beforeEach(() => {
      mockWeb3Service.signData = jest.fn((account, data, callback) => {
        callback(new Error())
      })
    })

    it('returns a Promise.reject', done => {
      Date.now = jest.fn(() => 1546219627000)
      let web3Service = new Web3Service(providers)

      generateJWTToken(
        web3Service,
        signatureData.invalid.address,
        signatureData.invalid.data
      ).catch(error => {
        expect(error).not.toBeNull()
        done()
      })
    })
  })
})
