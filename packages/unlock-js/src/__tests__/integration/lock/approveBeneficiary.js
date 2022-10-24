import {
  itIfErc20,
  versionEqualOrBelow,
  versionEqualOrAbove,
} from '../../helpers/integration'
import { ethers } from 'hardhat'

let web3Service, chainId, walletService, lock, lockAddress, ERC20

export default ({ isERC20, publicLockVersion }) =>
  () => {
    // only v8+ and removed in v12
    if (
      versionEqualOrAbove(publicLockVersion, 'v8') &&
      versionEqualOrBelow(publicLockVersion, 'v11')
    ) {
      let spender
      let receiver
      let receiverBalanceBefore
      let transactionHash

      beforeAll(async () => {
        ;({ web3Service, chainId, walletService, lock, lockAddress, ERC20 } =
          global.suiteData)
        ;[, spender, receiver] = await ethers.getSigners()
        // Get the erc20 balance of the user before the purchase
        receiverBalanceBefore = await web3Service.getTokenBalance(
          lock.currencyContractAddress,
          receiver.address,
          chainId
        )

        await walletService.approveBeneficiary(
          {
            lockAddress,
            spender: spender.address,
            amount: '10',
          },
          {} /** transactionOptions */,
          (error, hash) => {
            if (error) {
              throw error
            }
            transactionHash = hash
          }
        )

        // purchase a key (to increase lock ERC20 balance)
        await walletService.purchaseKey(
          {
            lockAddress,
            owner: spender.address,
            keyPrice: lock.keyPrice,
          },
          {} /** transactionOptions */,
          (error) => {
            if (error) {
              throw error
            }
          }
        )
      })

      itIfErc20(isERC20)('should have yielded a transaction hash', () => {
        expect.assertions(1)
        expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
      })

      itIfErc20(isERC20)('should have set lock erc20 allowance', async () => {
        expect.assertions(1)

        // make sure allowance has changed
        const allowance = await ERC20.allowance(lockAddress, spender.address)
        expect(allowance.toString()).toBe('10000000000000000000')
      })

      itIfErc20(isERC20)(
        'should allow to transfer funds directly from lock',
        async () => {
          expect.assertions(1)
          // transfer some tokens directly from lock
          await ERC20.connect(spender).transferFrom(
            lockAddress,
            receiver.address,
            '1000000000000000000'
          )

          // make sure tokens have been transferred
          const receiverBalanceAfter = await web3Service.getTokenBalance(
            lock.currencyContractAddress,
            receiver.address,
            chainId
          )

          expect(parseFloat(receiverBalanceAfter)).toBe(
            parseFloat(receiverBalanceBefore) + parseFloat(1)
          )
        }
      )
    }
  }
