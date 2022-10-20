import { versionEqualOrAbove } from '../../helpers/integration'
let walletService, web3Service, lockAddress, chainId

export default ({ publicLockVersion }) =>
  () => {
    if (versionEqualOrAbove(publicLockVersion, 'v7')) {
      beforeAll(() => {
        ;({ walletService, web3Service, lockAddress, chainId } =
          global.suiteData)
      })
      const keyGranter = '0x8Bf9b48D4375848Fb4a0d0921c634C121E7A7fd0'
      it('should not have key granter role for random address', async () => {
        expect.assertions(1)
        const isKeyManager = await web3Service.isKeyGranter(
          lockAddress,
          keyGranter,
          chainId
        )
        expect(isKeyManager).toBe(false)
      })

      it('should be able to grant the keyManager role', async () => {
        expect.assertions(2)
        const hasGrantedKeyGranter = await walletService.addKeyGranter({
          lockAddress,
          keyGranter,
        })
        expect(hasGrantedKeyGranter).toBe(true)
        const isKeyManager = await web3Service.isKeyGranter(
          lockAddress,
          keyGranter,
          chainId
        )
        expect(isKeyManager).toBe(true)
      })
    }
  }
