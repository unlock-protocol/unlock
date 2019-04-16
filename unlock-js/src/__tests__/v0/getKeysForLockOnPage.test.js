import Web3EthAbi from 'web3-eth-abi'
import Web3Service from '../../web3Service'
import getKeysForLockOnPage from '../../v0/getKeysForLockOnPage'
import NockHelper from '../helpers/nockHelper'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, true /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'

const pad64 = data => {
  return `${data.toString().padStart(64, '0')}`
}

const abiPaddedString = parameters => parameters.map(pad64).join('')

describe('v0', () => {
  beforeEach(() => {
    nock.cleanAll()
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })
    web3Service.getKeysForLockOnPage = getKeysForLockOnPage.bind(web3Service)
  })

  describe('getKeysForLockOnPage', () => {
    it('should get as many owners as there are per page, starting at the right index', done => {
      expect.assertions(9)
      const onPage = 0
      const byPage = 5
      const keyHolder = [
        '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        '0xC66Ef2E0D0eDCce723b3fdd4307db6c5F0Dda1b8',
      ]

      web3Service._getKeyByLockForOwner = jest.fn(() => {
        return new Promise(resolve => {
          return resolve([100, 'hello'])
        })
      })

      nock.ethCallAndYield(
        `0x10803b72${abiPaddedString([onPage, byPage])}`,
        lockAddress,
        Web3EthAbi.encodeParameter('uint256[]', keyHolder)
      )

      web3Service.getKeysForLockOnPage(lockAddress, onPage, byPage)

      web3Service.on('keys.page', (lock, page, keys) => {
        expect(lockAddress).toEqual(lock)
        expect(page).toEqual(onPage)
        expect(keys.length).toEqual(2)
        expect(keys[0].id).toEqual(`${lockAddress}-${keyHolder[0]}`)
        expect(keys[0].owner).toEqual(keyHolder[0])
        expect(keys[0].lock).toEqual(lockAddress)
        expect(keys[0].expiration).toEqual(100)
        expect(keys[0].data).toEqual('hello')
        expect(keys[1].owner).toEqual(keyHolder[1])
        done()
      })
    })

    describe('when the on contract method does not exist', () => {
      it('should use the iterative method of providing keyholder', done => {
        expect.assertions(3)
        const onPage = 0
        const byPage = 2

        for (let i = 0; i < byPage; i++) {
          const start = onPage * byPage + i
          nock.ethCallAndYield(
            `0x025e7c27${start.toString(16).padStart(64, 0)}`,
            lockAddress,
            '0x'
          )
        }

        jest
          .spyOn(web3Service, '_genKeyOwnersFromLockContract')
          .mockImplementation(() => {
            return Promise.resolve([])
          })
        jest.spyOn(web3Service, '_genKeyOwnersFromLockContractIterative')

        web3Service.getKeysForLockOnPage(lockAddress, onPage, byPage)

        web3Service.on('keys.page', (lock, page) => {
          expect(lockAddress).toEqual(lock)
          expect(page).toEqual(onPage)
          expect(
            web3Service._genKeyOwnersFromLockContractIterative
          ).toHaveBeenCalledTimes(1)
          done()
        })
      })
    })
  })
})
