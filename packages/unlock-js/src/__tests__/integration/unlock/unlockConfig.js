import { configureUnlock, deployTemplate } from '../../helpers'
import { chainId } from '../../helpers/integration'
import { ZERO } from '../../../constants'

let walletService, publicLockVersion

export default () => () => {
  let publicLockTemplateAddress
  beforeAll(() => {
    ;({ walletService, publicLockVersion } = global.suiteData)
  })
  it('should be able to deploy the lock contract template', async () => {
    expect.assertions(2)
    publicLockTemplateAddress = await deployTemplate(
      publicLockVersion,
      {} /** transactionOptions */,

      (error, hash) => {
        if (error) {
          throw error
        }
        expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/)
      }
    )
    expect(publicLockTemplateAddress).toMatch(/^0x[0-9a-fA-F]{40}$/)
  })

  it('should configure the unlock contract with the template, the token symbol and base URL', async () => {
    expect.assertions(2)
    let transactionHash
    const { unlockAddress } = walletService
    const receipt = await configureUnlock(
      unlockAddress,
      {
        publicLockTemplateAddress,
        globalTokenSymbol: 'TESTK',
        globalBaseTokenURI: 'https://locksmith.unlock-protocol.com/api/key/',
        unlockDiscountToken: ZERO,
        wrappedEth: ZERO,
        estimatedGasForPurchase: 0,
        chainId,
      },
      {} /** transactionOptions */,

      (error, hash) => {
        if (error) {
          throw error
        }
        transactionHash = hash
      }
    )
    expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
    expect(receipt.transactionHash).toEqual(transactionHash)
  })
}
