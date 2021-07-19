const BigNumber = require('bignumber.js')
const { constants } = require('hardlydifficult-eth')
const { ethers, assert, network, upgrades } = require('hardhat')
const Locks = require('../fixtures/locks')
const OZ_SDK_EXPORT = require('../../openzeppelin-cli-export.json')

const estimateGas = 252166

// NB : this needs to be run against a mainnet fork using
// import proxy info using legacy OZ CLI file export after migration to @openzepplein/upgrades
const [UDTProxyInfo] =
  OZ_SDK_EXPORT.networks.mainnet.proxies['unlock-protocol/UnlockDiscountToken']
const [UnlockProxyInfo] =
  OZ_SDK_EXPORT.networks.mainnet.proxies['unlock-protocol/Unlock']

const UDTProxyContractAdress = UDTProxyInfo.address // '0x90DE74265a416e1393A450752175AED98fe11517'
const UnlockContractAddress = UnlockProxyInfo.address // '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13'
const proxyAdminAddress = UDTProxyInfo.admin // '0x79918A4389A437906538E0bbf39918BfA4F7690e'

const deployerAddress = '0x33ab07dF7f09e793dDD1E9A25b079989a557119A'

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

contract('UnlockDiscountToken (on mainnet)', async () => {
  let udt
  let deployer
  let proxyAdmin

  before(async function setupMainnetForkTestEnv() {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }

    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [proxyAdminAddress],
    })
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [deployerAddress],
    })

    // get deployer
    proxyAdmin = await ethers.getSigner(proxyAdminAddress)
    deployer = await ethers.getSigner(deployerAddress)

    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountToken',
      deployer
    )

    udt = await UnlockDiscountToken.attach(UDTProxyContractAdress)
  })

  describe('The mainnet fork', () => {
    it('impersonates UDT deployer correctly', async () => {
      const { signer } = udt
      assert.equal(signer.address, deployerAddress)
    })

    it('UDT deployer has been revoked', async () => {
      assert.equal(await udt.isMinter(deployerAddress), false)
    })
  })

  describe('Existing UDT contract', () => {
    it('starting supply is NOT 0', async () => {
      const totalSupply = await udt.totalSupply()
      assert.equal(totalSupply.eq(0), false)
      // more than initial pre-mined 1M
      assert(totalSupply.gt(ethers.utils.parseEther('1000000')))
    })
  })

  describe('Supply', () => {
    it('Supply is preserved after upgrade', async () => {
      const totalSupply = await udt.totalSupply()

      // upgrade the contract
      const updated = await upgradeContract(udt.address)

      const totalSupplyAfterUpdate = await updated.totalSupply()
      assert.equal(totalSupplyAfterUpdate.toNumber(), totalSupply.toNumber())
    })

    it('Supply is updated when minting', async () => {
      const [, , recipient] = await ethers.getSigners()
      const mintAmount = 1000

      // upgrade
      const updated = await upgradeContract(udt.address)
      const totalSupply = await udt.totalSupply()

      // mint some tokens
      await udt.mint(recipient.address, mintAmount)
      const totalSupplyAfterUpdate = await updated.totalSupply()
      assert.equal(
        totalSupplyAfterUpdate.toNumber(),
        totalSupply.add(mintAmount)
      )
    })
  })

  describe('minting tokens', () => {
    let accounts
    let minter
    let referrer
    let keyBuyer
    let unlock
    let lock
    let rate

    beforeEach(async () => {
      accounts = await ethers.getSigners()
      minter = accounts[1]
      referrer = accounts[2]
      keyBuyer = accounts[3]

      const Unlock = await ethers.getContractFactory('Unlock', proxyAdmin)
      unlock = Unlock.attach(UnlockContractAddress)

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

      // Purchase a valid key for the referrer
      await lock.connect(referrer)
      await lock.purchase(0, referrer.address, constants.ZERO_ADDRESS, [], {
        value: await lock.keyPrice(),
      })

      // const tx = await lock.purchase(0, keyBuyer, referrer, [], {
      //   from: keyBuyer,
      //   value: await lock.keyPrice(),
      // })
      // const transaction = await web3.eth.getTransaction(tx.tx)
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
        await unlock.resetTrackedValue(initialGdp.toNumber(), 0)

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
        assert.equal(bn.shiftedBy(-18).toFixed(0), '10')
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
