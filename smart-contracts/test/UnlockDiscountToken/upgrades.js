const BigNumber = require('bignumber.js')
const path = require('path')
const fs = require('fs-extra')
const { time } = require('@openzeppelin/test-helpers')
const { ethers, upgrades, network, run } = require('hardhat')
const { constants, tokens, protocols } = require('hardlydifficult-eth')

const { getProxyAddress } = require('../../helpers/deployments')
const createLockHash = require('../helpers/createLockCalldata')

const Locks = require('../fixtures/locks')

// skip on coverage until solidity-coverage supports EIP-1559
const describeOrskip = process.env.IS_COVERAGE ? describe.skip : describe

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

const UnlockDiscountTokenV1 = require.resolve(
  '@unlock-protocol/contracts/dist/UnlockDiscountToken/UnlockDiscountToken.sol'
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

contract('UnlockDiscountToken upgrade', async () => {
  let udt
  const mintAmount = 1000

  before(async function copyAndBuildContract() {
    // make sure mocha doesnt time out
    this.timeout(200000)

    // copy previous UDT version over
    await fs.copy(
      UnlockDiscountTokenV1,
      path.resolve(contractsPath, 'UnlockDiscountTokenV1.sol')
    )

    // re-compile contract using hardhat
    await run('compile')

    // deploy udt
    const UnlockDiscountToken = await ethers.getContractFactory(
      'contracts/past-versions/UnlockDiscountTokenV1.sol:UnlockDiscountToken'
    )

    const [, minter] = await ethers.getSigners()
    const udtSigned = await UnlockDiscountToken.connect(minter)

    udt = await upgrades
      .deployProxy(udtSigned, [minter.address], {
        kind: 'transparent',
        initializer: 'initialize(address)',
      })
      .then((f) => f.deployed())
  })

  after(async () => {
    await fs.remove(contractsPath)
    await fs.remove(artifactsPath)
  })

  describe('Details', () => {
    it('name is preserved', async () => {
      const name = await udt.name()
      assert.equal(name, 'Unlock Discount Token')
      const updated = await upgradeContract(udt.address)
      const updatedName = await updated.name()
      assert.equal(updatedName, 'Unlock Discount Token')
    })

    it('symbol is preserved', async () => {
      const symbol = await udt.symbol()
      assert.equal(symbol, 'UDT')
      const updated = await upgradeContract(udt.address)
      const updatedSymbol = await updated.symbol()
      assert.equal(updatedSymbol, 'UDT')
    })

    it('decimals are preserved', async () => {
      const decimals = await udt.decimals()
      assert.equal(decimals, 18)
      const updated = await upgradeContract(udt.address)
      const updatedDecimals = await updated.decimals()
      assert.equal(updatedDecimals, 18)
    })
  })

  describe('Supply', () => {
    it('starting supply is 0', async () => {
      const totalSupply = await udt.totalSupply()
      assert.equal(totalSupply.toNumber(), 0, 'starting supply must be 0')
    })

    it('Supply is preserved after upgrade', async () => {
      const [, , recipient] = await ethers.getSigners()

      // mint some tokens
      await udt.mint(recipient.address, mintAmount)
      const totalSupply = await udt.totalSupply()
      assert.equal(totalSupply.toNumber(), mintAmount)

      // upgrade
      const updated = await upgradeContract(udt.address)

      const totalSupplyAfterUpdate = await updated.totalSupply()
      assert.equal(totalSupplyAfterUpdate.toNumber(), mintAmount)
    })
  })

  describe('Minting tokens', () => {
    let accounts
    let unlock
    let minter
    let referrer
    let keyBuyer
    let lock
    let rate

    before(async () => {
      accounts = await ethers.getSigners()
      minter = accounts[1]
      keyBuyer = accounts[3]
      referrer = accounts[5]

      const Unlock = await ethers.getContractFactory('Unlock')
      const { chainId } = await ethers.provider.getNetwork()
      const unlockAddress = getProxyAddress(chainId, 'Unlock')
      unlock = Unlock.attach(unlockAddress)

      // Grant Unlock minting permissions
      await udt.addMinter(unlock.address)

      // upgrade contract
      await upgradeContract(udt.address)
      udt.connect(minter)

      // create lock
      const args = [
        Locks.FIRST.expirationDuration.toFixed(),
        web3.utils.padLeft(0, 40),
        Locks.FIRST.keyPrice.toFixed(),
        Locks.FIRST.maxNumberOfKeys.toFixed(),
        Locks.FIRST.lockName,
      ]
      const calldata = await createLockHash({ args })
      const tx = await unlock.createUpgradeableLock(calldata)

      const { events } = await tx.wait()
      const evt = events.find((v) => v.event === 'NewLock')
      const PublicLock = await ethers.getContractFactory('PublicLock')
      lock = await PublicLock.attach(evt.args.newLockAddress)

      // Deploy the exchange
      const weth = await tokens.weth.deploy(web3, minter.address)
      const uniswapRouter = await protocols.uniswapV2.deploy(
        web3,
        minter.address,
        constants.ZERO_ADDRESS,
        weth.address
      )

      // Create UDT <-> WETH pool
      await udt.mint(minter.address, web3.utils.toWei('1000000', 'ether'))
      await udt.approve(uniswapRouter.address, constants.MAX_UINT)
      await uniswapRouter.addLiquidityETH(
        udt.address,
        web3.utils.toWei('1000000', 'ether'),
        '1',
        '1',
        minter.address,
        constants.MAX_UINT,
        { from: minter.address, value: web3.utils.toWei('40', 'ether') }
      )

      const uniswapOracle = await protocols.uniswapOracle.deploy(
        web3,
        minter.address,
        await uniswapRouter.factory()
      )

      // Advancing time to avoid an intermittent test fail
      await time.increase(time.duration.hours(1))

      // Do a swap so there is some data accumulated
      await uniswapRouter.swapExactETHForTokens(
        1,
        [weth.address, udt.address],
        minter.address,
        constants.MAX_UINT,
        { value: web3.utils.toWei('1', 'ether') }
      )

      // Config in Unlock
      await unlock.configUnlock(
        udt.address,
        weth.address,
        estimateGas,
        await unlock.globalTokenSymbol(),
        await unlock.globalBaseTokenURI(),
        1 // mainnet
      )
      await unlock.setOracle(udt.address, uniswapOracle.address)

      // Advance time so 1 full period has past and then update again so we have data point to read
      await time.increase(time.duration.hours(30))
      await uniswapOracle.update(weth.address, udt.address, {
        from: minter.address,
      })

      // Purchase a valid key for the referrer
      await lock.connect(referrer)
      await lock.purchase(
        [],
        [referrer.address],
        [web3.utils.padLeft(0, 40)],
        [web3.utils.padLeft(0, 40)],
        [[]],
        {
          value: await lock.keyPrice(),
        }
      )

      // allow multiiple keys per owner
      await lock.setMaxKeysPerAddress(10)

      rate = await uniswapOracle.consult(
        udt.address,
        web3.utils.toWei('1', 'ether'),
        weth.address
      )
    })

    it('exchange rate is > 0', async () => {
      assert.notEqual(web3.utils.fromWei(rate.toString(), 'ether'), 0)
      // 1 UDT is worth ~0.000042 ETH
      assert.equal(new BigNumber(rate).shiftedBy(-18).toFixed(5), '0.00004')
    })

    it('referrer has 0 UDT to start', async () => {
      const actual = await udt.balanceOf(referrer.address)
      assert.equal(actual.toString(), 0)
    })

    it('owner starts with 0 UDT', async () => {
      const owner = await unlock.owner()
      const balance = await udt.balanceOf(owner)
      assert(balance.eq(0), `balance not null ${balance.toString()}`)
    })

    describe('mint by gas price', () => {
      let gasSpent

      before(async () => {
        // buy a key
        lock.connect(keyBuyer)
        const { blockNumber } = await lock.purchase(
          [],
          [keyBuyer.address],
          [referrer.address],
          [web3.utils.padLeft(0, 40)],
          [[]],
          {
            value: await lock.keyPrice(),
          }
        )
        // using estimatedGas instead of the actual gas used so this test does not regress as other features are implemented
        const { baseFeePerGas } = await ethers.provider.getBlock(blockNumber)
        gasSpent = new BigNumber(baseFeePerGas.toString()).times(estimateGas)
      })

      it('referrer has some UDT now', async () => {
        const actual = await udt.balanceOf(referrer.address)
        assert.notEqual(actual.toString(), '0')
      })

      it('amount minted for referrer ~= gas spent', async () => {
        // 120 UDT minted * 0.000042 ETH/UDT == 0.005 ETH spent
        assert.equal(
          new BigNumber((await udt.balanceOf(referrer.address)).toString())
            .shiftedBy(-18) // shift UDT balance
            .times(rate)
            .shiftedBy(-18) // shift the rate
            .toFixed(3),
          gasSpent.shiftedBy(-18).toFixed(3)
        )
      })

      it('amount minted for dev ~= gas spent * 20%', async () => {
        assert.equal(
          new BigNumber((await udt.balanceOf(await unlock.owner())).toString())
            .shiftedBy(-18) // shift UDT balance
            .times(rate)
            .shiftedBy(-18) // shift the rate
            .toFixed(3),
          gasSpent.times(0.25).shiftedBy(-18).toFixed(3)
        )
      })
    })

    describeOrskip('mint capped by % growth', () => {
      before(async () => {
        // 1,000,000 UDT minted thus far
        // Test goal: 10 UDT minted for the referrer (less than the gas cost equivalent of ~120 UDT)
        // keyPrice / GNP / 2 = 10 * 1.25 / 1,000,000 == 40,000 * keyPrice
        const initialGdp = (await lock.keyPrice()).mul(40000)
        await unlock.resetTrackedValue(initialGdp.toString(), 0)

        const baseFeePerGas = 1000000000 // in gwei
        await network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
          ethers.BigNumber.from(baseFeePerGas).toHexString(16),
        ])

        lock.connect(keyBuyer)
        await lock.purchase(
          [],
          [keyBuyer.address],
          [referrer.address],
          [web3.utils.padLeft(0, 40)],
          [[]],
          {
            value: await lock.keyPrice(),
            gasPrice: ethers.BigNumber.from(baseFeePerGas)
              .mul(2)
              .toHexString(16),
          }
        )
      })

      it('referrer has some UDT now', async () => {
        const actual = await udt.balanceOf(referrer.address)
        assert.notEqual(actual.toString(), 0)
      })

      it('amount minted for referrer ~= 10 UDT', async () => {
        const balance = await udt.balanceOf(referrer.address)
        const bn = new BigNumber(balance.toString())
        assert.equal(bn.shiftedBy(-18).toFixed(0), '10')
      })

      it('amount minted for dev ~= 2 UDT', async () => {
        const balance = await udt.balanceOf(await unlock.owner())
        assert.equal(
          new BigNumber(balance.toString()).shiftedBy(-18).toFixed(0),
          '2'
        )
      })
    })
  })
})
