const { config, ethers, assert, network, upgrades } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const OZ_SDK_EXPORT = require('../../openzeppelin-cli-export.json')
const { errorMessages } = require('../helpers/constants')
const multisigABI = require('../helpers/ABIs/multisig.json')
const proxyABI = require('../helpers/ABIs/proxy.json')

const { VM_ERROR_REVERT_WITH_REASON } = errorMessages

// NB : this needs to be run against a mainnet fork using
// import proxy info using legacy OZ CLI file export after migration to @openzepplein/upgrades
const [UDTProxyInfo] =
  OZ_SDK_EXPORT.networks.mainnet.proxies['unlock-protocol/UnlockDiscountToken']
const UDTProxyContractAddress = UDTProxyInfo.address // '0x90DE74265a416e1393A450752175AED98fe11517'
const proxyAdminAddress = UDTProxyInfo.admin // '0x79918A4389A437906538E0bbf39918BfA4F7690e'

const deployerAddress = '0x33ab07dF7f09e793dDD1E9A25b079989a557119A'
const multisigAddress = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'
const ZERO_ADDRESS = web3.utils.padLeft(0, 40)

// helper function
const upgradeContract = async () => {
  // prepare upgrade and deploy new contract implementation
  const deployer = await ethers.getSigner(deployerAddress)
  const UnlockDiscountTokenV2 = await ethers.getContractFactory(
    'UnlockDiscountTokenV2',
    deployer
  )
  const newImpl = await upgrades.prepareUpgrade(
    UDTProxyContractAddress,
    UnlockDiscountTokenV2,
    {}
  )

  // update contract implementation address in proxy admin using multisig
  const multisig = await ethers.getContractAt(multisigABI, multisigAddress)

  const signers = await multisig.getOwners()
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [signers[0]],
  })
  // give some ETH
  const balance = ethers.utils.hexStripZeros(ethers.utils.parseEther('1000'))
  await network.provider.send('hardhat_setBalance', [signers[0], balance])

  const issuer = await ethers.getSigner(signers[0])
  const multisigIssuer = multisig.connect(issuer)

  // build upgrade tx
  const proxy = await ethers.getContractAt(proxyABI, UDTProxyContractAddress)
  const data = proxy.interface.encodeFunctionData('upgrade', [
    UDTProxyContractAddress,
    newImpl,
  ])

  // submit proxy upgrade tx
  const tx = await multisigIssuer.submitTransaction(
    proxyAdminAddress,
    0, // ETH value
    data
  )

  // get tx id
  const { events } = await tx.wait()
  const evt = events.find((v) => v.event === 'Confirmation')
  const transactionId = evt.args[1]

  // reach concensus
  await Promise.all(
    signers.slice(1, 4).map(async (signerAddress) => {
      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [signerAddress],
      })
      const balance = ethers.utils.hexStripZeros(
        ethers.utils.parseEther('1000')
      )
      await network.provider.send('hardhat_setBalance', [
        signerAddress,
        balance,
      ])

      const signer = await ethers.getSigner(signerAddress)

      const m = multisig.connect(signer)
      await m.confirmTransaction(transactionId, { gasLimit: 1200000 })
    })
  )

  return UnlockDiscountTokenV2.attach(UDTProxyContractAddress)
}

contract('UnlockDiscountToken (on mainnet)', async () => {
  let udt
  let deployer

  before(async function setupMainnetForkTestEnv() {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // reset fork
    const { forking } = config.networks.hardhat
    await network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: forking.url,
            blockNumber: forking.blockNumber,
          },
        },
      ],
    })

    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [deployerAddress],
    })

    // give some ETH to deployer
    const balance = ethers.utils.hexStripZeros(ethers.utils.parseEther('1000'))
    await network.provider.send('hardhat_setBalance', [
      deployerAddress,
      balance,
    ])

    // get UDT instance
    deployer = await ethers.getSigner(deployerAddress)
    const UnlockDiscountToken = await ethers.getContractFactory(
      'UnlockDiscountToken',
      deployer
    )

    udt = UnlockDiscountToken.attach(UDTProxyContractAddress)
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

  describe('Existing UDT contract (before upgrade)', () => {
    it('starting supply > 1M', async () => {
      const totalSupply = await udt.totalSupply()
      assert.equal(totalSupply.eq(0), false)
      // more than initial pre-mined 1M
      assert(totalSupply.gt(ethers.utils.parseEther('1000000')))
    })

    it('name is set', async () => {
      const name = await udt.name()
      assert.equal(name, 'Unlock Discount Token')
    })

    it('symbol is set', async () => {
      const symbol = await udt.symbol()
      assert.equal(symbol, 'UDT')
    })

    it('decimals are set', async () => {
      const decimals = await udt.decimals()
      assert.equal(decimals, 18)
    })

    it('lives at the same address', async () => {
      assert.equal(udt.address, UDTProxyContractAddress)
    })

    /*
    // TODO: why bytes length difference btw builds?
    // 10390
    // +10352
    it('is the same bytecode as local version', async () => {
      const UnlockDiscountToken = await ethers.getContractFactory(
        'UnlockDiscountToken'
      )
      const deployedByteCode = await ethers.provider.getCode(
        UDTProxyInfo.implementation
      )
      deployedAbi.forEach((d, i) => {
        assert.deepEqual(deployedAbi[i], abi[i])
        // console.log(deployedAbi[i], abi[i], '\n\n')
      })
      assert.equal(UnlockDiscountToken.bytecode.length, deployedByteCode.length)
      assert.equal(`${UnlockDiscountToken.bytecode}`, `${deployedByteCode}`)
    })
    */
  })

  describe('Existing supply', () => {
    it('Supply is preserved after upgrade', async () => {
      const totalSupply = await udt.totalSupply()

      // upgrade the contract
      const updated = await upgradeContract()

      const totalSupplyAfterUpdate = await updated.totalSupply()
      assert.equal(totalSupplyAfterUpdate.toString(), totalSupply.toString())
    })

    it('New tokens can not be issued anymore', async () => {
      const [, minter] = await ethers.getSigners()

      // upgrade
      const updated = await upgradeContract()

      // mint tokens
      await reverts(
        updated.addMinter(minter.address),
        `${VM_ERROR_REVERT_WITH_REASON} 'MinterRole: caller does not have the Minter role'`
      )
    })
  })

  describe('Details', () => {
    it('name is preserved', async () => {
      const updated = await upgradeContract()
      const updatedName = await updated.name()
      assert.equal(updatedName, 'Unlock Discount Token')
    })

    it('symbol is preserved', async () => {
      const updated = await upgradeContract()
      const updatedSymbol = await updated.symbol()
      assert.equal(updatedSymbol, 'UDT')
    })

    it('decimals are preserved', async () => {
      const updated = await upgradeContract()
      const updatedDecimals = await updated.decimals()
      assert.equal(updatedDecimals, 18)
    })
  })

  describe('Multisig', () => {
    it('tx is deployed properly', async () => {
      await upgradeContract()
      const multisig = await ethers.getContractAt(multisigABI, multisigAddress)

      const transactionId = (await multisig.transactionCount()).toNumber() - 1
      const count = await multisig.getConfirmationCount(transactionId)
      assert.equal(4, await count.toNumber())
      assert(await multisig.isConfirmed(transactionId))
      const [, , , executed] = await multisig.transactions(transactionId)
      assert(executed)
    })
  })
  /*
  describe('minting tokens', () => {
    let accounts
    let minter
    let referrer
    let keyBuyer
    let unlock
    let lock
    let initialBalance
    let initialSupply

    before(async () => {
      accounts = await ethers.getSigners()
      minter = accounts[1]
      referrer = accounts[2]
      keyBuyer = accounts[3]

      const Unlock = await ethers.getContractFactory('Unlock', deployer)
      unlock = Unlock.attach(UnlockContractAddress)

      // upgrade contract
      udt = await upgradeContract()
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

      const owner = await unlock.owner()
      initialBalance = await udt.balanceOf(owner)
      initialSupply = await udt.totalSupply()
    })

    it('referrer has 0 UDT to start', async () => {
      const balance = await udt.balanceOf(referrer.address)
      assert(balance.eq(0), `balance not null ${balance.toString()}`)
    })

    it('owner starts with some UDT', async () => {
      assert.equal(
        initialBalance.eq(0),
        false,
        `balance not null ${initialBalance.toString()}`
      )
    })

    describe('mint by gas price', () => {
      before(async () => {
        // buy a key
        lock.connect(keyBuyer)
        await lock.purchase(0, keyBuyer.address, referrer.address, [], {
          value: await lock.keyPrice(),
        })
      })

      it('referrer has some UDT now', async () => {
        const actual = await udt.balanceOf(referrer.address)
        assert.notEqual(actual.toString(), 0)
      })

      it('owner has earnt some UDT too', async () => {
        const actual = await udt.balanceOf(await unlock.owner())
        assert(actual.gt(initialBalance))
      })

      it('total supply changed', async () => {
        const actual = await udt.totalSupply()
        assert(actual.gt(initialSupply))
      })
    })

    describe('mint capped by % growth', () => {
      before(async () => {
        lock.connect(keyBuyer)
        await lock.purchase(0, keyBuyer.address, referrer.address, [], {
          value: await lock.keyPrice(),
        })
      })

      it('referrer has some UDT now', async () => {
        const actual = await udt.balanceOf(referrer.address)
        assert.equal(actual.eq(0), false)
      })

      it('owner has earnt some UDT too', async () => {
        const actual = await udt.balanceOf(await unlock.owner())
        assert(actual.gt(initialBalance))
      })

      it('total supply changed', async () => {
        const actual = await udt.totalSupply()
        assert(actual.gt(initialSupply))
      })
    })
  })
*/
  describe('governance', () => {
    describe('Delegation', () => {
      it('delegation with balance', async () => {
        const multisig = await ethers.getContractAt(
          multisigABI,
          multisigAddress
        )

        const [holderAddress] = await multisig.getOwners()
        await network.provider.request({
          method: 'hardhat_impersonateAccount',
          params: [holderAddress],
        })
        const holder = await ethers.getSigner(holderAddress)

        // make the upgrade
        udt = await upgradeContract()
        udt = udt.connect(holder)

        // delegate some votes
        const supply = await udt.balanceOf(holder.address)
        const [recipient] = await ethers.getSigners()
        const tx = await udt.delegate(recipient.address)
        const { events, blockNumber } = await tx.wait()

        const evtChanged = events.find((v) => v.event === 'DelegateChanged')
        const [delegator, fromDelegate, toDelegate] = evtChanged.args

        const evtVotesChanges = events.find(
          (v) => v.event === 'DelegateVotesChanged'
        )
        const [delegate, previousBalance, newBalance] = evtVotesChanges.args

        assert.equal(delegator, holder.address)
        assert.equal(fromDelegate, ZERO_ADDRESS)
        assert.equal(toDelegate, recipient.address)

        assert.equal(delegate, recipient.address)
        assert.equal(previousBalance, '0')
        assert(newBalance.eq(supply))

        assert(supply.eq(await udt.getCurrentVotes(recipient.address)))
        assert(
          (await udt.getPriorVotes(recipient.address, blockNumber - 1)).eq(0)
        )
        await time.advanceBlock()
        assert(
          supply.eq(await udt.getPriorVotes(recipient.address, blockNumber))
        )
      })
    })
  })
})
