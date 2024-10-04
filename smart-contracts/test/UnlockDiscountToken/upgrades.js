const assert = require('assert')
const path = require('path')
const fs = require('fs-extra')
const { ethers, upgrades, network, run } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers')
const { createMockOracle, deployWETH, almostEqual } = require('../helpers')
const deployContracts = require('../fixtures/deploy')

const {
  createLockCalldata,
  lockFixtures: Locks,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')

// skip on coverage until solidity-coverage supports EIP-1559
const describeOrSkip = process.env.IS_COVERAGE ? describe.skip : describe

const estimateGas = BigInt(252166 * 2)

// 1 UDT is worth ~0.00000042 ETH
const UDT_WETH_RATE = ethers.parseEther('0.00000042')

// files path
const contractsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'contracts',
  'past-versions'
)
const artifactsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'artifacts',
  'contracts',
  'past-versions'
)

const UnlockDiscountTokenV2 = require.resolve(
  '@unlock-protocol/contracts/dist/UnlockDiscountToken/UnlockDiscountTokenV2.sol'
)

// helper function
const upgradeContract = async (contractAddress) => {
  const UnlockDiscountTokenV3 = await ethers.getContractFactory(
    'UnlockDiscountTokenV3'
  )
  const updated = await upgrades.upgradeProxy(
    contractAddress,
    UnlockDiscountTokenV3,
    {}
  )
  return updated
}

describe('UnlockDiscountToken upgrade', async () => {
  let udt
  const mintAmount = 1000

  before(async function copyAndBuildContract() {
    // make sure mocha doesnt time out
    this.timeout(200000)

    // copy previous UDT version over
    await fs.copy(
      UnlockDiscountTokenV2,
      path.resolve(contractsPath, 'UnlockDiscountTokenV2.sol')
    )

    // re-compile contract using hardhat
    await run('compile')

    // deploy udt
    const UnlockDiscountToken = await ethers.getContractFactory(
      'contracts/past-versions/UnlockDiscountTokenV2.sol:UnlockDiscountTokenV2'
    )

    const [deployer] = await ethers.getSigners()
    const udtSigned = await UnlockDiscountToken.connect(deployer)

    udt = await upgrades.deployProxy(udtSigned, [await deployer.getAddress()], {
      kind: 'transparent',
      initializer: 'initialize(address)',
    })
  })

  after(async () => {
    await fs.remove(contractsPath)
    await fs.remove(artifactsPath)
  })

  describe('Details', () => {
    it('name is preserved', async () => {
      const name = await udt.name()
      assert.equal(name, 'Unlock Discount Token')
      const updated = await upgradeContract(await udt.getAddress())
      const updatedName = await updated.name()
      assert.equal(updatedName, 'Unlock Discount Token')
    })

    it('symbol is preserved', async () => {
      const symbol = await udt.symbol()
      assert.equal(symbol, 'UDT')
      const updated = await upgradeContract(await udt.getAddress())
      const updatedSymbol = await updated.symbol()
      assert.equal(updatedSymbol, 'UDT')
    })

    it('decimals are preserved', async () => {
      const decimals = await udt.decimals()
      assert.equal(decimals, 18)
      const updated = await upgradeContract(await udt.getAddress())
      const updatedDecimals = await updated.decimals()
      assert.equal(updatedDecimals, 18)
    })
  })

  describe('Supply', () => {
    it('starting supply is 0', async () => {
      const totalSupply = await udt.totalSupply()
      assert.equal(totalSupply, 0, 'starting supply must be 0')
    })

    it('Supply is preserved after upgrade', async () => {
      const [, , recipient] = await ethers.getSigners()

      // mint some tokens
      await udt.mint(await recipient.getAddress(), mintAmount)
      const totalSupply = await udt.totalSupply()
      assert.equal(totalSupply, mintAmount)

      // upgrade
      const updated = await upgradeContract(await udt.getAddress())

      const totalSupplyAfterUpdate = await updated.totalSupply()
      assert.equal(totalSupplyAfterUpdate, mintAmount)
    })
  })

  describe('Minting tokens', () => {
    let unlock
    let deployer
    let lockOwner
    let referrer
    let referrer2
    let keyBuyer
    let lock
    let rate

    before(async () => {
      ;[deployer, lockOwner, keyBuyer, referrer, referrer2] =
        await ethers.getSigners()

      const { unlock: unlockDeployed } = await deployContracts()
      unlock = unlockDeployed

      // Grant Unlock minting permissions
      await udt.addMinter(await unlock.getAddress())

      // upgrade contract
      await upgradeContract(await udt.getAddress())

      // create lock
      const args = [
        Locks.FIRST.expirationDuration,
        ADDRESS_ZERO,
        Locks.FIRST.keyPrice,
        Locks.FIRST.maxNumberOfKeys,
        Locks.FIRST.lockName,
      ]
      const calldata = await createLockCalldata({
        args,
        from: await lockOwner.getAddress(),
      })
      const tx = await unlock.createUpgradeableLock(calldata)

      const receipt = await tx.wait()
      const evt = await getEvent(receipt, 'NewLock')
      const PublicLock = await ethers.getContractFactory(
        'contracts/PublicLock.sol:PublicLock'
      )
      lock = await PublicLock.attach(evt.args.newLockAddress)

      const weth = await deployWETH(deployer)

      // Deploy the exchange
      const oracle = await createMockOracle({
        rates: [
          // UDT <> WETH rate
          {
            tokenIn: await udt.getAddress(),
            rate: UDT_WETH_RATE,
            tokenOut: await weth.getAddress(),
          },
        ],
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

      // set value in oracle
      await unlock.setOracle(await udt.getAddress(), await oracle.getAddress())

      // Purchase a valid key for the referrers
      await lock
        .connect(keyBuyer)
        .purchase(
          [],
          [await referrer.getAddress(), await referrer2.getAddress()],
          [ADDRESS_ZERO, ADDRESS_ZERO],
          [ADDRESS_ZERO, ADDRESS_ZERO],
          ['0x', '0x'],
          {
            value: (await lock.keyPrice()) * 2n,
          }
        )

      // allow multiple keys per owner
      await lock
        .connect(lockOwner)
        .updateLockConfig(
          await lock.expirationDuration(),
          await lock.maxNumberOfKeys(),
          10
        )

      rate = await oracle.consult(
        await udt.getAddress(),
        ethers.parseUnits('1', 'ether'),
        await weth.getAddress()
      )

      // Give unlock contract some tokens
      await udt.mint(
        await unlock.getAddress(),
        ethers.parseUnits('1000000', 'ether')
      )
    })

    it('exchange rate is correct', async () => {
      // 1 UDT is worth ~0.000042 ETH
      assert.equal(rate, UDT_WETH_RATE)
    })

    it('referrer has 0 UDT to start', async () => {
      const actual = await udt.balanceOf(await referrer.getAddress())
      assert.equal(actual, 0)
    })

    describeOrSkip('mint by gas price', () => {
      let balanceReferrerBefore
      before(async () => {
        balanceReferrerBefore = await udt.balanceOf(await referrer.getAddress())

        // set 1% protocol fee
        await unlock.setProtocolFee(100)

        // buy a key
        lock.connect(keyBuyer)
        const { blockNumber } = await lock.purchase(
          [],
          [await keyBuyer.getAddress()],
          [await referrer.getAddress()],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: await lock.keyPrice(),
          }
        )

        assert.equal(await lock.balanceOf(await keyBuyer.getAddress()), '1')
      })

      it('referrer has some UDT now', async () => {
        // referrer got sth
        const actual = await udt.balanceOf(await referrer.getAddress())
        assert.notEqual(actual, 0n)

        // amount of UDT earned should be equal to half of the fee
        const amountEarned = actual - balanceReferrerBefore
        const fee = ((await lock.keyPrice()) * 100n) / 10000n
        assert.equal(amountEarned, ((fee / 2n) * rate) / 10n ** 18n)
      })
    })
  })
})
