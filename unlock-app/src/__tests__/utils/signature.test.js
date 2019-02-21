import EventEmitter from 'events'
import Web3Service from '../../services/web3Service'
import configure from '../../config'
import generateSignature from '../../utils/signature'

const signatureData = require('./fixtures/signatureData')

class MockWebService extends EventEmitter {
  constructor() {
    super()
    this.ready = true
    this.currentProvider = { isMetaMask: false }
  }
}

let mockWeb3Service = new MockWebService()

jest.mock('../../services/web3Service', () => {
  return function() {
    return mockWeb3Service
  }
})

class MockTypedDataSignature {
  constructor() {
    this.generateSignature = jest.fn(() => {
      return 'data'
    })
  }
}

let mockTypedDataSignature = new MockTypedDataSignature()

jest.mock('../../utils/typedDataSignature', () => {
  return function() {
    return mockTypedDataSignature
  }
})

const validOwner = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const validAddress = '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83'

const { providers } = configure(global)

describe('generateSignature', () => {
  describe('when authorized to sign the payload', () => {
    beforeEach(() => {
      const validSignature =
        'MHhkYTk4ZDY0MjVkZTc1NjAyNjFlYTM0MzVmNzFkYjhhYmFlY2JjYzM1ZjczNWZhZDM0OGQ2ODZkZGM2OTM0ZWE1M2FjOTY2ZmNhYjNkZTA0NmNmMjdjOGY1YmI5NGQ3ZjA0NzY0NWU2ZTczN2I0ZTQwZjAzZjJkMDg4Y2E2NWMxMDFi'

      mockWeb3Service.signData = jest.fn((account, data, callback) => {
        callback(null, validSignature)
      })
    })

    it('generates a signature for the provided type data', () => {
      Date.now = jest.fn(() => 1546219627000)
      let web3Service = new Web3Service(providers)

      let lockData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
            { name: 'salt', type: 'bytes32' },
          ],
          Lock: [
            { name: 'name', type: 'string' },
            { name: 'owner', type: 'address' },
            { name: 'address', type: 'address' },
          ],
        },
        domain: { name: 'Unlock Dashboard', version: '1' },
        primaryType: 'Lock',
        message: {
          lock: {
            name: 'New Lock',
            owner: validOwner,
            address: validAddress,
          },
        },
      }

      generateSignature(web3Service, validOwner, {
        name: 'New Lock',
        owner: validOwner,
        address: validAddress,
      })

      expect(mockTypedDataSignature.generateSignature).toHaveBeenCalledWith(
        validOwner,
        lockData
      )
    })
  })

  describe('when an exception is raised when attempting to sign', () => {
    beforeEach(() => {
      mockTypedDataSignature.generateSignature = jest.fn(() => {
        throw new Error('A new error')
      })
    })

    it('returns a Promise.reject', done => {
      let web3Service = new Web3Service(providers)

      generateSignature(
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
