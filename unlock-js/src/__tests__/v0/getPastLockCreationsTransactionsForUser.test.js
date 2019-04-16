import * as UnlockV0 from 'unlock-abi-0'
import Web3Service from '../../web3Service'
import getPastLockCreationsTransactionsForUser from '../../v0/getPastLockCreationsTransactionsForUser'
import NockHelper from '../helpers/nockHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12

describe('v0', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })
    web3Service.getPastLockCreationsTransactionsForUser = getPastLockCreationsTransactionsForUser.bind(
      web3Service
    )
  })

  describe('getPastLockCreationsTransactionsForUser', () => {
    it('should getPastEvents for the Unlock contract', () => {
      expect.assertions(3)

      class MockContract {
        constructor(abi, address) {
          expect(abi).toBe(UnlockV0.Unlock.abi)
          expect(address).toEqual(web3Service.unlockContractAddress)
        }
      }
      web3Service.web3.eth.Contract = MockContract

      const userAddress = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
      web3Service._getPastTransactionsForContract = jest.fn()

      web3Service.getPastLockCreationsTransactionsForUser(userAddress)
      expect(web3Service._getPastTransactionsForContract).toHaveBeenCalledWith(
        expect.any(MockContract),
        'NewLock',
        {
          lockOwner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        }
      )
    })
  })
})
