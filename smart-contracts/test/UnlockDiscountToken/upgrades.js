const { assert } = require('chai')
const BigNumber = require('bignumber.js')
const path = require('path')
const fs = require('fs-extra')
const { ethers, upgrades, network, run } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers')
const { createUniswapV2Exchange, increaseTime } = require('../helpers')
const deployContracts = require('../fixtures/deploy')

const {
  createLockCalldata,
  lockFixtures: Locks,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')

// skip on coverage until solidity-coverage supports EIP-1559
const describeOrSkip = process.env.IS_COVERAGE ? describe.skip : describe

const estimateGas = 252166 * 2

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
      await increaseTime(30)
      await oracle.update(await weth.getAddress(), await udt.getAddress())

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
            value: (await lock.keyPrice()) * 2,
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

    it('exchange rate is > 0', async () => {
      assert.notEqual(ethers.formatUnits(rate), 0)
      // 1 UDT is worth ~0.000042 ETH
      assert.equal(Math.floor(ethers.formatUnits(rate, 12)), 42)
    })

    it('referrer has 0 UDT to start', async () => {
      const actual = await udt.balanceOf(await referrer.getAddress())
      assert.equal(actual, 0)
    })

    describe('mint by gas price', () => {
      let gasSpent
      before(async () => {
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

        // using estimatedGas instead of the actual gas used so this test does not regress as other features are implemented
        const { baseFeePerGas } = await ethers.provider.getBlock(blockNumber)
        gasSpent = new BigNumber(baseFeePerGas).times(estimateGas)
      })

      it('referrer has some UDT now', async () => {
        const actual = await udt.balanceOf(await referrer.getAddress())
        assert.notEqual(actual, '0')
      })

      it('amount minted for referrer ~= gas spent', async () => {
        // 120 UDT minted * 0.000042 ETH/UDT == 0.005 ETH spent
        assert.equal(
          new BigNumber(await udt.balanceOf(await referrer.getAddress()))
            .shiftedBy(-18) // shift UDT balance
            .times(rate)
            .shiftedBy(-18) // shift the rate
            .toFixed(3),
          gasSpent.shiftedBy(-18).toFixed(3)
        )
      })
    })

    describeOrSkip('mint capped by % growth', () => {
      before(async () => {
        // 1,000,000 UDT minted thus far
        // Test goal: 10 UDT minted for the referrer (less than the gas cost equivalent of ~120 UDT)
        // keyPrice / GNP / 2 = 10 * 1.25 / 1,000,000 == 40,000 * keyPrice
        const initialGdp = (await lock.keyPrice()) * 40000
        await unlock.resetTrackedValue(initialGdp, 0)

        const baseFeePerGas = 1000000000 // in gwei
        await network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
          BigInt(baseFeePerGas).toHexString(16),
        ])

        lock.connect(keyBuyer)
        await lock.purchase(
          [],
          [await keyBuyer.getAddress()],
          [await referrer2.getAddress()],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: (await lock.keyPrice()) * 2,
            gasPrice: BigInt(baseFeePerGas) * (2).toHexString(16),
          }
        )
      })

      it('referrer has some UDT now', async () => {
        const actual = await udt.balanceOf(await referrer2.getAddress())
        assert.notEqual(actual, 0)
      })

      it('amount minted for referrer ~= 12 UDT', async () => {
        const balance = await udt.balanceOf(await referrer2.getAddress())
        const bn = new BigNumber(balance)
        assert.equal(bn.shiftedBy(-18).toFixed(0), '12')
      })
    })
  })
})
