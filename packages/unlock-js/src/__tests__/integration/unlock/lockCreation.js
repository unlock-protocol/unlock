import { versionEqualOrBelow } from '../../helpers/integration'

let lockCreationHash,
  web3Service,
  lockAddress,
  lock,
  lockParams,
  accounts,
  chainId

export default ({ publicLockVersion }) =>
  () => {
    beforeAll(() => {
      ;({
        lockCreationHash,
        web3Service,
        lockAddress,
        lock,
        lockParams,
        accounts,
        chainId,
      } = global.suiteData)
    })
    it('should have yielded a transaction hash', () => {
      expect.assertions(1)
      expect(lockCreationHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
    })

    it('should have deployed the right lock version', async () => {
      expect.assertions(1)
      const lockVersion = await web3Service.lockContractAbiVersion(lockAddress)
      expect(lockVersion.version).toEqual(publicLockVersion)
    })

    it('should have deployed the right lock name', () => {
      expect.assertions(1)
      expect(lock.name).toEqual(lockParams.name)
    })

    it('should have deployed the right lock maxNumberOfKeys', () => {
      expect.assertions(1)
      expect(lock.maxNumberOfKeys).toEqual(lockParams.maxNumberOfKeys)
    })

    it('should have deployed the right lock keyPrice', () => {
      expect.assertions(1)
      expect(lock.keyPrice).toEqual(lockParams.keyPrice)
    })

    it('should have deployed the right lock expirationDuration', () => {
      expect.assertions(1)
      expect(lock.expirationDuration).toEqual(lockParams.expirationDuration)
    })

    it('should have deployed the right currency', () => {
      expect.assertions(1)
      expect(lock.currencyContractAddress).toEqual(
        lockParams.currencyContractAddress
      )
    })

    it('should have set the creator as a lock manager', async () => {
      expect.assertions(1)
      const isLockManager = await web3Service.isLockManager(
        lockAddress,
        accounts[0],
        chainId
      )
      expect(isLockManager).toBe(true)
    })

    // beneficiary was removed on version 12
    if (versionEqualOrBelow(publicLockVersion, 'v11')) {
      it('should have deployed a lock to the right beneficiary', () => {
        expect.assertions(1)
        expect(lock.beneficiary).toEqual(accounts[0]) // This is the default in walletService
      })
    }
  }
