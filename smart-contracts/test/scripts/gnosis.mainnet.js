const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

const {
  deployLock,
  impersonate,
  confirmMultisigTx,
  UNLOCK_MULTISIG_ADDRESS,
  MULTISIG_ADDRESS_OWNER,
} = require('../helpers')

const {
  getSafe,
  submitTx,
  getSafeAddress,
  getOwners,
} = require('../../scripts/multisig')

const { assert } = require('chai')
const { unlockAddress } = networks[1]

// should run on mainnet only
describe('scripts / gnosis', () => {
  let safe
  let signer
  let unlock
  let publicLockUpgraded

  // all suite will be skipped if not on mainnet fork
  before(async function () {
    if (!process.env.RUN_MAINNET_FORK) {
      this.skip()
    }
    unlock = await ethers.getContractAt('Unlock', unlockAddress)

    // impersonate one of the multisig owner
    await impersonate(MULTISIG_ADDRESS_OWNER)
    signer = await ethers.getSigner(MULTISIG_ADDRESS_OWNER)

    // get mainnet safe
    safe = await getSafe({ safeAddress: UNLOCK_MULTISIG_ADDRESS, signer })
  })

  describe('helpers / getSafe', () => {
    it('get the correct safe', async () => {
      assert.equal(safe.address, UNLOCK_MULTISIG_ADDRESS)
      const owners = await safe.getOwners()
      assert.equal(owners[0], '0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44')
      assert.equal(owners[1], '0x2785f2a3DDaCfDE5947F1A9D6c878CCD7F885400')
      assert.equal(owners.length, 9)
    })
  })

  describe('get safe address', () => {
    it('should get the correct address based on chain id', async () => {
      assert.equal(await getSafeAddress({ chainId: 1 }), await unlock.owner())
      assert.equal(
        await getSafeAddress({ chainId: 1 }),
        UNLOCK_MULTISIG_ADDRESS
      )
      assert.equal(
        await getSafeAddress({ chainId: 4 }),
        '0x04e855D82c079222d6bDBc041F6202d5A0137267'
      )
      assert.equal(
        await getSafeAddress({ chainId: 100 }),
        '0xfAC611a5b5a578628C28F77cEBDDB8C6159Ae79D'
      )
    })
  })

  describe('get owners', () => {
    it('should get the correct list of owners based on chain id', async () => {
      const owners = await getOwners({ chainId: 1 })
      assert.equal(owners[0], '0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44')
      assert.equal(owners[1], '0x2785f2a3DDaCfDE5947F1A9D6c878CCD7F885400')
      assert.equal(owners.length, 9)
    })
    it('should get the correct list of owners based on safe address', async () => {
      const owners = await getOwners({
        safeAddress: '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9',
      })
      assert.equal(owners[0], '0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44')
      assert.equal(owners[1], '0x2785f2a3DDaCfDE5947F1A9D6c878CCD7F885400')
      assert.equal(owners.length, 9)
    })
  })

  describe('submitting some txs', () => {
    let previousTxCount
    let addLockTemplateTx
    let setLockTemplateTx
    let events
    let events2

    before(async () => {
      // deploy new implementation
      const PublicLockUpgraded = await ethers.getContractFactory(
        'TestPublicLockUpgraded'
      )
      publicLockUpgraded = await PublicLockUpgraded.deploy()
      await publicLockUpgraded.deployed()
      const publicLockLatestVersion =
        await publicLockUpgraded.publicLockVersion()

      previousTxCount = await safe.transactionCount()

      // submit to multisig
      addLockTemplateTx = {
        contractName: 'Unlock',
        contractAddress: unlockAddress,
        functionName: 'addLockTemplate',
        functionArgs: [publicLockUpgraded.address, publicLockLatestVersion],
      }
      ;({ events } = await submitTx({
        tx: addLockTemplateTx,
        safeAddress: safe.address,
        signer,
      }))
      assert.equal(
        (await safe.transactionCount()).toNumber(),
        previousTxCount.toNumber() + 1
      )

      // submit 2nd tx
      setLockTemplateTx = {
        contractName: 'Unlock',
        contractAddress: unlockAddress,
        functionName: 'setLockTemplate',
        functionArgs: [publicLockUpgraded.address],
      }
      ;({ events: events2 } = await submitTx({
        tx: setLockTemplateTx,
        safeAddress: safe.address,
        signer,
      }))
    })

    it('events are fired properly', async () => {
      // check if contract events have been fired properly
      assert.equal(
        events
          .find(({ event }) => event === 'Submission')
          .args.transactionId.toNumber(),
        previousTxCount.toNumber()
      )
      assert.equal(
        events
          .find(({ event }) => event === 'Confirmation')
          .args.transactionId.toNumber(),
        previousTxCount.toNumber()
      )
      assert.equal(
        events.find(({ event }) => event === 'Confirmation').args.sender,
        signer.address
      )

      // 2nd tx
      assert.equal(
        events2
          .find(({ event }) => event === 'Submission')
          .args.transactionId.toNumber(),
        previousTxCount.toNumber() + 1
      )
      assert.equal(
        events2
          .find(({ event }) => event === 'Confirmation')
          .args.transactionId.toNumber(),
        previousTxCount.toNumber() + 1
      )
      assert.equal(
        events2.find(({ event }) => event === 'Confirmation').args.sender,
        signer.address
      )
    })

    it('updated tx count accordingly', async () => {
      assert.equal(
        (await safe.transactionCount()).toNumber(),
        previousTxCount.toNumber() + 2
      )
    })

    it('submit the tx correctly to the mutisig', async () => {
      const { interface } = unlock
      // this is actually previous index (length - 1) + 1
      let [destination, value, data, executed] = await safe.transactions(
        previousTxCount
      )
      assert.equal(destination, unlock.address)
      assert.equal(value, 0)
      assert.equal(
        data,
        interface.encodeFunctionData(
          addLockTemplateTx.functionName,
          addLockTemplateTx.functionArgs
        )
      )
      assert.equal(executed, false)

      // assert 2nd tx too
      ;[destination, value, data, executed] = await safe.transactions(
        previousTxCount.toNumber() + 1
      )
      assert.equal(destination, unlock.address)
      assert.equal(value, 0)
      assert.equal(
        data,
        interface.encodeFunctionData(
          setLockTemplateTx.functionName,
          setLockTemplateTx.functionArgs
        )
      )
      assert.equal(executed, false)
    })

    it('tx got correctly executed', async () => {
      // confirm a version has been added
      await confirmMultisigTx({ transactionId: previousTxCount.toNumber() })
      const version = await publicLockUpgraded.publicLockVersion()
      assert.equal(
        await unlock.publicLockImpls(version),
        publicLockUpgraded.address
      )
      assert.equal(
        await unlock.publicLockVersions(publicLockUpgraded.address),
        version
      )
      // confirm the new version is correctly set
      await confirmMultisigTx({ transactionId: previousTxCount.toNumber() + 1 })
      const { address } = await deployLock({ unlock })
      const lock = await ethers.getContractAt('TestPublicLockUpgraded', address)

      assert.equal(await lock.sayHello(), 'hello world')
      assert.equal(await lock.publicLockVersion(), version)
    })
  })
})
