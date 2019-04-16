import Web3Utils from 'web3-utils'

import * as UnlockV0 from 'unlock-abi-0'
import Web3Service from '../../web3Service'
import getTransactionType from '../../v0/getTransactionType'
import NockHelper from '../helpers/nockHelper'
import TransactionTypes from '../../transactionTypes'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

describe('v01', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })
    web3Service.getTransactionType = getTransactionType.bind(web3Service)
  })

  describe('getTransactionType', () => {
    it('should return null if there is no matching method', () => {
      expect.assertions(1)
      const data = 'notarealmethod'
      expect(web3Service.getTransactionType(UnlockV0.Unlock, data)).toBe(null)
    })

    it('should return the right transaction type on lock creation', () => {
      expect.assertions(1)
      const unlock = new web3Service.web3.eth.Contract(UnlockV0.Unlock.abi, '')
      const data = unlock.methods
        .createLock('1000', '1000000000', '1')
        .encodeABI()
      expect(web3Service.getTransactionType(UnlockV0.Unlock, data)).toBe(
        TransactionTypes.LOCK_CREATION
      )
    })

    it('should return the right transaction type on key purchase', () => {
      expect.assertions(1)
      const lock = new web3Service.web3.eth.Contract(
        UnlockV0.PublicLock.abi,
        ''
      )
      const data = lock.methods
        .purchaseFor(account, Web3Utils.utf8ToHex(''))
        .encodeABI()
      expect(web3Service.getTransactionType(UnlockV0.PublicLock, data)).toBe(
        TransactionTypes.KEY_PURCHASE
      )
    })

    it('should return the right transaction type on withdrawals', () => {
      expect.assertions(1)
      const lock = new web3Service.web3.eth.Contract(
        UnlockV0.PublicLock.abi,
        ''
      )
      const data = lock.methods.withdraw().encodeABI()
      expect(web3Service.getTransactionType(UnlockV0.PublicLock, data)).toBe(
        TransactionTypes.WITHDRAWAL
      )
    })
  })
})
