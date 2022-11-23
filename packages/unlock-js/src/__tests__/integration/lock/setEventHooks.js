let walletService, web3Service, chainId, lockAddress
import { ZERO } from '../../../constants'
import { versionEqualOrAbove } from '../../helpers/integration'

export default ({ publicLockVersion }) =>
  () => {
    if (versionEqualOrAbove(publicLockVersion, 'v7')) {
      let transactionHash
      let keyPurchaseHook
      let keyCancelHook

      beforeAll(async () => {
        ;({ walletService, web3Service, chainId, lockAddress } =
          global.suiteData)

        await walletService.setEventHooks(
          {
            lockAddress,
            network: chainId,
          },
          {} /** transactionOptions */,
          (error, hash) => {
            if (error) {
              throw error
            }
            transactionHash = hash
          }
        )

        keyPurchaseHook = await web3Service.onKeyPurchaseHook({
          lockAddress,
          network: chainId,
        })

        keyCancelHook = await web3Service.onKeyCancelHook({
          lockAddress,
          network: chainId,
        })
      })

      it('should have yielded a transaction hash', () => {
        expect.assertions(1)
        expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
      })

      it('return to the correct default value', async () => {
        expect.assertions(2)
        expect(keyCancelHook).toEqual(ZERO)
        expect(keyPurchaseHook).toEqual(ZERO)
      })
    }
  }
