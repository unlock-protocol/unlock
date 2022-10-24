let walletService, web3Service, chainId, lock, lockAddress, accounts
import {
  versionEqualOrAbove,
  versionEqualOrBelow,
} from '../../helpers/integration'

export default ({ publicLockVersion }) =>
  () => {
    const newTokenURI = 'http://some-custom-uri.com/'

    let changedTokenURI
    let transactionHash
    let lockContract

    beforeAll(async () => {
      ;({ accounts, walletService, web3Service, chainId, lock, lockAddress } =
        global.suiteData)

      lockContract = await walletService.getLockContract(lockAddress)
      changedTokenURI = await walletService.setBaseTokenURI(
        {
          lockAddress,
          baseTokenURI: newTokenURI,
        },
        {} /** transactionOptions */,
        (error, hash) => {
          if (error) {
            throw error
          }
          transactionHash = hash
        }
      )
      lock = await web3Service.getLock(lockAddress, chainId)
    })

    it('should have yielded a transaction hash', () => {
      expect.assertions(1)
      expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
    })

    it('return to the correct value', async () => {
      expect.assertions(1)
      expect(changedTokenURI).toEqual(newTokenURI)
    })

    it('set tokenURI correctly', async () => {
      expect.assertions(1)
      const keyOwner = accounts[4]
      const tokenId = await walletService.purchaseKey({
        lockAddress,
        owner: keyOwner,
        keyPrice: lock.keyPrice,
      })
      expect(await lockContract.tokenURI(tokenId)).toEqual(
        versionEqualOrBelow(publicLockVersion, 'v7')
          ? `${newTokenURI}${lockAddress}/${tokenId}`.toLowerCase()
          : `${newTokenURI}${tokenId}`.toLowerCase()
      )
    })

    if (versionEqualOrAbove(publicLockVersion, 'v8')) {
      it('should have updated all tokenURIs', async () => {
        expect.assertions(2)
        expect(await lockContract.tokenURI(0)).toEqual(newTokenURI)
        expect(await lockContract.tokenURI(123)).toEqual(`${newTokenURI}123`)
      })
    }
  }
