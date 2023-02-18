import Web3Service from '../web3Service'
import PublicLockVersions from '../PublicLock'
import networks from '@unlock-protocol/networks'

var web3Service = new Web3Service(networks)
const lock = {
  address: '0xe6a85e67905d41a479a32ff59892861351c825e8',
  network: 5,
}

jest.setTimeout(100000)

describe('Web3Service', () => {
  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']
    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async (method) => {
        expect.assertions(3)
        const args = [lock.address, lock.network]
        const result = {
          unlockContractAddress: networks[lock.network].unlockAddress,
        }
        const version = {
          [method](_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.lockContractAbiVersion = jest.fn(() => version)
        const r = await web3Service[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    it.each(Object.keys(PublicLockVersions))(
      'should implement all the required methods',
      (versionNumber) => {
        expect.assertions(1)
        const version = PublicLockVersions[versionNumber]
        versionSpecificLockMethods.forEach((method) => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })

  describe('Lock validation', () => {
    it.each(Object.keys(PublicLockVersions))(
      'getLock validation on public lock %s',
      async () => {
        expect.assertions(2)
        const service = new Web3Service(networks)
        const response = await service.getLock(lock.address, 5)
        expect(response.address).toBe(lock.address)
        const notFromUnlockFactoryContract = async () => {
          // Fake generated address
          const response = await service.getLock(
            '0xAfC5356c67853fC8045586722fE6a253023039eB',
            5
          )
          return response
        }
        await expect(notFromUnlockFactoryContract).rejects.toThrow()
      }
    )
  })

  describe('recoverAccountFromSignedData', () => {
    it('returns the signing address', async () => {
      expect.hasAssertions()

      const data = 'hello world'
      const account = '0x14791697260E4c9A71f18484C9f997B308e59325'
      const signature =
        '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63' +
        '265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b8' +
        '1c'

      const returnedAddress = await web3Service.recoverAccountFromSignedData(
        data,
        signature
      )

      expect(returnedAddress).toBe(account)
    })
  })
})
