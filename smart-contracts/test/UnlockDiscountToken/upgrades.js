const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')
const { ethers, upgrades } = require('hardhat')
const { constants, tokens, protocols } = require('hardlydifficult-eth')

const { getProxyAddress } = require('../../helpers/proxy')
const Locks = require('../fixtures/locks')

const estimateGas = 252166

// helper function
const upgradeContract = async (contractAddress) => {
  const UnlockDiscountTokenV2 = await ethers.getContractFactory(
    'UnlockDiscountTokenV2'
  )
  const updated = await upgrades.upgradeProxy(
    contractAddress,
    UnlockDiscountTokenV2,
    {}
  )
  return updated
}

contract('UnlockDiscountToken upgrade', async () => {
  let udt
  const mintAmount = 1000

  beforeEach(async () => {
    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountToken'
    )

    const [deployer, minter] = await ethers.getSigners()
    const udtSigned = await UnlockDiscountToken.connect(minter)

    udt = await upgrades
      .deployProxy(udtSigned, [minter.address], {
        kind: 'transparent',
        initializer: 'initialize(address)',
      })
      .then((f) => f.deployed())
  })

  describe('Supply', () => {
    it('Starting supply is 0', async () => {
      const totalSupply = await udt.totalSupply()
      assert.equal(totalSupply.toNumber(), 0, 'starting supply must be 0')
    })

    it('Supply is preserved after upgrade', async () => {
      const [deployer, minter, recipient] = await ethers.getSigners()

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

    beforeEach(async () => {
      accounts = await ethers.getSigners()
      minter = accounts[1]
      referrer = accounts[2]
      keyBuyer = accounts[3]

      const Unlock = await ethers.getContractFactory('Unlock')
      const unlockAddress = await getProxyAddress(web3, 'Unlock')
      unlock = Unlock.attach(unlockAddress)

      // Grant Unlock minting permissions
      await udt.addMinter(unlock.address)

      // upgrade contract
      await upgradeContract(udt.address)
      udt.connect(minter)

      // create lock
      const tx = await unlock.createLock(
        Locks.FIRST.expirationDuration.toFixed(),
        web3.utils.padLeft(0, 40),
        Locks.FIRST.keyPrice.toFixed(),
        Locks.FIRST.maxNumberOfKeys.toFixed(),
        Locks.FIRST.lockName,
        // This ensures that the salt is unique even if we deploy locks multiple times
        ethers.utils.randomBytes(12)
      )

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
        web3.utils.toWei('10', 'ether'),
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
      await lock.purchase(0, referrer.address, constants.ZERO_ADDRESS, [], {
        value: await lock.keyPrice(),
      })
      
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

      beforeEach(async () => {
        
        // buy a key
        lock.connect(keyBuyer)
        const tx = await lock.purchase(
          0,
          keyBuyer.address,
          referrer.address,
          [],
          {
            value: await lock.keyPrice(),
          }
        )
        // using estimatedGas instead of the actual gas used so this test does not regress as other features are implemented
        gasSpent = new BigNumber(tx.gasPrice).times(estimateGas)
      })

      it('referrer has some UDT now', async () => {
        const actual = await udt.balanceOf(referrer.address)
        assert.notEqual(actual.toString(), 0)
      })

      it('amount minted for referrer ~= gas spent', async () => {
        // 120 UDT minted * 0.000042 ETH/UDT == 0.005 ETH spent
        assert.equal(
          new BigNumber(await udt.balanceOf(referrer.address))
            .shiftedBy(-18) // shift UDT balance
            .times(rate)
            .shiftedBy(-18) // shift the rate
            .toFixed(3),
          gasSpent.shiftedBy(-18).toFixed(3)
        )
      })

      it('amount minted for dev ~= gas spent * 20%', async () => {
        assert.equal(
          new BigNumber(await udt.balanceOf(await unlock.owner()))
            .shiftedBy(-18) // shift UDT balance
            .times(rate)
            .shiftedBy(-18) // shift the rate
            .toFixed(3),
          gasSpent.times(0.25).shiftedBy(-18).toFixed(3)
        )
      })
    })

    describe('mint capped by % growth', () => {
      
      beforeEach(async () => {
        // 1,000,000 UDT minted thus far
        // Test goal: 10 UDT minted for the referrer (less than the gas cost equivalent of ~120 UDT)
        // keyPrice / GNP / 2 = 10 * 1.25 / 1,000,000 == 40,000 * keyPrice
        const initialGdp = (await lock.keyPrice()).mul(40000)
        await unlock.resetTrackedValue(initialGdp, 0)

        lock.connect(keyBuyer)
        await lock.purchase(0, keyBuyer.address, referrer.address, [], {
          value: await lock.keyPrice(),
        })
      })

      it('referrer has some UDT now', async () => {
        const actual = await udt.balanceOf(referrer.address)
        assert.notEqual(actual.toString(), 0)
      })

      it('amount minted for referrer ~= 10 UDT', async () => {
        const balance = await udt.balanceOf(referrer.address)
        // console.log(balance.toNumber())
        const bn = new BigNumber(balance.toNumber())
        // console.log(bn.shiftedBy(-18).toFixed(0))
        assert.equal( bn.shiftedBy(-18).toFixed(0), '10' )
      })

      it('amount minted for dev ~= 2 UDT', async () => {
        const balance = await udt.balanceOf(await unlock.owner())
        assert.equal(
          new BigNumber(balance.toNumber()).shiftedBy(-18).toFixed(0),
          '2'
        )
      })
    })
  })
})
