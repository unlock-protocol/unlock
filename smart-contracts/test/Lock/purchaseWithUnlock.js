const assert = require('assert')
const { ethers } = require('hardhat')
const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')
const {
  ADDRESS_ZERO,
  deployContracts,
  increaseTime,
  createUniswapV2Exchange,
  getBalance,
} = require('../helpers')
const { ZeroAddress } = require('ethers')

const keyPrice = ethers.parseEther('0.01')
const estimateGas = BigInt(252166 * 2)

describe('Lock / purchaseWithUnlock', () => {
  let unlock
  let lock
  let udt, amount
  let deployer, signer

  // setup proxy admin etc
  before(async () => {
    ;({ unlock, udt } = await deployContracts())
    ;[deployer, signer] = await ethers.getSigners()
    amount = ethers.parseEther('50')

    await udt.connect(signer).mint(await unlock.getAddress(), amount)
    await udt.connect(signer).addMinter(await deployer.getAddress())

    await unlock.configUnlock(
      await udt.getAddress(),
      ADDRESS_ZERO,
      10000,
      'KEY',
      'https://unlock-test',
      31337
    )

    // Deploy the exchange
    const { oracle, weth } = await createUniswapV2Exchange({
      protocolOwner: deployer,
      minter: deployer,
      udtAddress: await udt.getAddress(),
    })

    // Config in Unlock
    await unlock.configUnlock(
      await udt.getAddress(),
      await weth.getAddress(),
      estimateGas,
      await unlock.globalTokenSymbol(),
      await unlock.globalBaseTokenURI(),
      1 // mainnet
    )
    await unlock.setOracle(await udt.getAddress(), await oracle.getAddress())

    // Advance time so 1 full period has past and then update again so we have data point to read
    await increaseTime(30 * 3600)
    await oracle.update(await weth.getAddress(), await udt.getAddress())
  })

  describe('purchase with a lock while Unlock is broken', () => {
    beforeEach(async () => {
      // create a new lock
      const args = [60 * 60 * 24 * 30, ZeroAddress, keyPrice, 100, 'Test lock']

      const calldata = await createLockCalldata({
        args,
        from: await deployer.getAddress(),
      })
      const tx = await unlock.createUpgradeableLock(calldata)
      const receipt = await tx.wait()
      const {
        args: { newLockAddress },
      } = await getEvent(receipt, 'NewLock')

      lock = await ethers.getContractAt(
        'contracts/PublicLock.sol:PublicLock',
        newLockAddress
      )
    })

    it('should transfer udt to referrer when purchase', async () => {
      const udtBalanceBefore = await getBalance(
        await deployer.getAddress(),
        await udt.getAddress()
      )

      const tx = await lock
        .connect(signer)
        .purchase(
          [keyPrice],
          [await signer.getAddress()],
          [await deployer.getAddress()],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: keyPrice,
          }
        )
      const receipt = await tx.wait()

      // make sure transfer happened
      const transfer = await getEvent(receipt, 'Transfer')
      assert.equal(transfer.args.to, await signer.getAddress())
      assert.equal(transfer.args.tokenId == 1, true)

      const udtBalanceAfter = await getBalance(
        await deployer.getAddress(),
        await udt.getAddress()
      )
      assert.notEqual(udtBalanceAfter, udtBalanceBefore)
    })
  })
})
