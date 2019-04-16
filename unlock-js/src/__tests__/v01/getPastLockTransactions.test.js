import * as UnlockV0 from 'unlock-abi-0'
import Web3Service from '../../web3Service'

import getPastLockTransactions from '../../v0/getPastLockTransactions'
import NockHelper from '../helpers/nockHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12

describe('v01', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })
    web3Service.getPastLockTransactions = getPastLockTransactions.bind(
      web3Service
    )
  })

  describe('getPastLockTransactions', () => {
    it('should getPastEvents for the Lock contract', () => {
      expect.assertions(3)
      const lockAddress = '0x123'
      class MockContract {
        constructor(abi, address) {
          expect(abi).toBe(UnlockV0.PublicLock.abi)
          expect(address).toEqual(lockAddress)
        }
      }

      web3Service.web3.eth.Contract = MockContract

      web3Service._getPastTransactionsForContract = jest.fn()

      web3Service.getPastLockTransactions(lockAddress)
      expect(web3Service._getPastTransactionsForContract).toHaveBeenCalledWith(
        expect.any(MockContract),
        'allevents'
      )
    })
  })
})
