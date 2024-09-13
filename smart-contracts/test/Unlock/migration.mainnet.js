/**
 * To run this you will need to
 *
 * 1 start a mainnet fork node
 * RUN_FORK=1 yarn hardhat node
 *
 * 2 deploy the new unlock
 * RUN_FORK=1 yarn hardhat deploy:unlock --network localhost
 *
 * 3 copy/paste the newly deployed Unlock address in 2 places:
 * - below in  NEW_UNLOCK_ADDRESS
 * - in `contracts/mixins/MixinKeys.sol` in the `migrate()` (l ~174)
 *
 * 4 run this file against the node
 * RUN_FORK=1 yarn hardhat test test/Unlock/migration.mainnet.js --network localhost
 */
const { ethers } = require('hardhat')
const assert = require('assert')

const {
  getNetwork,
  impersonate,
  deployLock,
  purchaseKey,
  addSomeETH,
  confirmMultisigTx,
  getSafe,
  reverts,
} = require('../helpers')

const { submitTx } = require('@unlock-protocol/governance/scripts/multisig')

const NEW_UNLOCK_ADDRESS = '0xe79B93f8E22676774F2A8dAd469175ebd00029FA'

let unlock,
  publicLock,
  unlockModified,
  lock,
  signer,
  keyOwner,
  unlockAddress,
  multisig

describe(`Unlock migration`, function () {
  before(async function () {
    if (!process.env.RUN_FORK) {
      // all suite will be skipped
      this.skip()
    }

    // fund signers
    ;[signer, keyOwner] = await ethers.getSigners()
    await addSomeETH(await signer.getAddress())
    await addSomeETH(await keyOwner.getAddress())

    // get original Unlock contract
    ;({ multisig, unlockAddress } = await getNetwork())
    unlock = await ethers.getContractAt('Unlock', unlockAddress)

    // create a (v12) lock
    lock = await deployLock({ unlock, isEthers: true })

    // purchase a key
    await purchaseKey(lock, await keyOwner.getAddress())

    // impersonate one of the multisig owner

    const multisigSigner = await impersonate(
      await (await getSafe(multisig)).owner()
    )

    // deploy new template
    const PublicLockV13 = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    publicLock = await PublicLockV13.deploy()

    console.log(`PublicLockV13 > deployed at ${await publicLock.getAddress()}`)

    // submit the new tempalte in old unlock (using multisig)
    const addLockTemplateTx = {
      contractName: 'Unlock',
      contractAddress: unlockAddress,
      functionName: 'addLockTemplate',
      functionArgs: [await publicLock.getAddress(), 13],
    }

    const txIdv13 = await submitTx({
      tx: addLockTemplateTx,
      safeAddress: multisig,
      signer: multisigSigner,
    })

    await confirmMultisigTx({ transactionId: txIdv13 })

    // set the new v13 template as default in old unlock (using multisig)
    const setLockTemplateTx = {
      contractName: 'Unlock',
      contractAddress: unlockAddress,
      functionName: 'setLockTemplate',
      functionArgs: [await publicLock.getAddress()],
    }
    const txId2 = await submitTx({
      tx: setLockTemplateTx,
      safeAddress: multisig,
      signer: multisigSigner,
    })

    await confirmMultisigTx({ transactionId: txId2 })

    console.log(
      `UNLOCK (old) > upgraded template to ${await unlock.publicLockLatestVersion()}`
    )

    // get freshly redeployed new Unlock
    unlockModified = await ethers.getContractAt('Unlock', NEW_UNLOCK_ADDRESS)
  })

  describe('Unlock (old) settings', () => {
    it('correct v13 template', async () => {
      assert.equal(
        await unlock.publicLockAddress(),
        await publicLock.getAddress()
      )
      assert.equal(await unlock.publicLockLatestVersion(), 13)
    })
  })

  describe('Lock before upgrade', () => {
    it('show previous unlock address', async () => {
      assert.equal(await lock.unlockProtocol(), await unlock.getAddress())
    })
  })

  describe('Lock upgrade', () => {
    before(async () => {
      assert.equal(await lock.publicLockVersion(), 12)
      // upgrade the lock
      await unlock.upgradeLock(await lock.getAddress(), 13)
    })
    it('upgrade version correctly', async () => {
      assert.equal(await lock.publicLockVersion(), 13)
    })
    it('show new unlock address', async () => {
      assert.equal(
        await lock.unlockProtocol(),
        await unlockModified.getAddress()
      )
    })
    it('new unlock has lock info', async () => {
      const lockBalance = await unlockModified.locks(await lock.getAddress())
      assert.equal(lockBalance.deployed, true)
      assert.equal(lockBalance.totalSales, await lock.keyPrice())
      assert.equal(lockBalance.yieldedDiscountTokens, 0)
    })
  })

  describe('Migrate lock (directly using migrate function)', () => {
    let calldata
    before(async () => {
      // set new Unlock address in lock
      const encoder = ethers.AbiCoder.defaultAbiCoder()
      calldata = encoder.encode(
        ['address'],
        [await unlockModified.getAddress()]
      )
    })

    it('reverts if the lock has already been upgraded to 13', async () => {
      await reverts(lock.migrate(calldata), 'SCHEMA_VERSION_NOT_CORRECT')
    })
  })
})
