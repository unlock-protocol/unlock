/**
 * To run this you will need to
 * 
 * 1. start a mainnet fork node 
 * RUN_FORK=1 yarn hardhat node 
 * 
 * 2. deploy the new unlock
 * RUN_FORK=1 yarn hardhat deploy:unlock --network localhost
 * 
 * 3. copy/paste the newly deployed Unlock address in 2 places:
 * - below in  NEW_UNLOCK_ADDRESS
 * - in `contracts/mixins/MixinKeys.sol` in the `migrate()` (l. ~174)
 * 
 * 4. run this file against the node 
 * RUN_FORK=1 yarn hardhat test test/Unlock/migration.mainnet.js --network localhost
 */
const { ethers } = require('hardhat')
const { expect } = require('chai')

const {
  UNLOCK_ADDRESS,
  UNLOCK_MULTISIG_ADDRESS,
  impersonate,
  deployLock,
  purchaseKey,
  addSomeETH,
  confirmMultisigTx,
  MULTISIG_ADDRESS_OWNER,
  reverts,
} = require('../helpers')

const { submitTx } = require('../../scripts/multisig')

const NEW_UNLOCK_ADDRESS = '0x7039d2BB4CfC5f5DA49E6b4b9c40400bccb0d1E8'

let unlock, publicLock, unlockModified, lock, signer, keyOwner

describe(`Unlock migration`, function() {

  before(async function() {
    if (!(process.env.RUN_FORK)) {
      // all suite will be skipped
      this.skip()
    }
    
    // fund signers
    ;[signer, keyOwner] = await ethers.getSigners()
    await addSomeETH(signer.address)
    await addSomeETH(keyOwner.address)

    // get original Unlock contract
    unlock = await ethers.getContractAt('Unlock', UNLOCK_ADDRESS)

    // create a (v12) lock
    lock = await deployLock({ unlock, isEthers: true })
    
    // purchase a key
    await purchaseKey(lock, keyOwner.address)

    // impersonate one of the multisig owner
    const multisigSigner = await impersonate(MULTISIG_ADDRESS_OWNER);

    // deploy new template
    const PublicLockV13 = await ethers.getContractFactory('PublicLock')
    publicLock = await PublicLockV13.deploy()
    await publicLock.deployed()
    console.log(`PublicLockV13 > deployed at ${publicLock.address}`)

    // submit the new tempalte in old unlock (using multisig)
    const addLockTemplateTx = {
      contractName: 'Unlock',
      contractAddress: UNLOCK_ADDRESS,
      functionName: 'addLockTemplate',
      functionArgs: [publicLock.address, 13],
    }

    const txIdv13 = await submitTx({
      tx: addLockTemplateTx,
      safeAddress: UNLOCK_MULTISIG_ADDRESS,
      signer: multisigSigner,
    })

    await confirmMultisigTx({ transactionId: txIdv13 })

    // set the new v13 template as default in old unlock (using multisig)
    const setLockTemplateTx = {
      contractName: 'Unlock',
      contractAddress: UNLOCK_ADDRESS,
      functionName: 'setLockTemplate',
      functionArgs: [publicLock.address],
    }
    const txId2 = await submitTx({
      tx: setLockTemplateTx,
      safeAddress: UNLOCK_MULTISIG_ADDRESS,
      signer: multisigSigner,
    })
    
    await confirmMultisigTx({ transactionId: txId2 })

    console.log(`UNLOCK (old) > upgraded template to ${await unlock.publicLockLatestVersion()}`)

    // get freshly redeployed new Unlock
    unlockModified = await ethers.getContractAt('Unlock', NEW_UNLOCK_ADDRESS)
  })

  describe('Unlock (old) settings', () => {
    it('correct v13 template', async () => {
      expect(await unlock.publicLockAddress()).to.equals(publicLock.address)
      expect(await unlock.publicLockLatestVersion()).to.equals(13)
    })
  })

  describe('Lock before upgrade', () => {
    it('show previous unlock address', async () => {
      expect(await lock.unlockProtocol()).to.equals(unlock.address)
    })
  })

  describe('Lock upgrade', () => {
    before(async () => {
      expect(await lock.publicLockVersion()).to.equals(12)
      // upgrade the lock
      await unlock.upgradeLock(lock.address, 13)
    })
    it('upgrade version correctly', async () => {
      expect(await lock.publicLockVersion()).to.equals(13)
    })
    it('show new unlock address', async () => {
      expect(await lock.unlockProtocol()).to.equals(unlockModified.address)
    })
    it('new unlock has lock info', async () => {
      const lockBalance = await unlockModified.locks(lock.address)
      expect(lockBalance.deployed).to.equals(true)
      expect(lockBalance.totalSales.toString()).to.equals((await lock.keyPrice()).toString())
      expect(lockBalance.yieldedDiscountTokens.toNumber()).to.equals(0)
    })
  })

  describe('Migrate lock (directly using migrate function)', () => {
    let calldata
    before(async () => {
      // set new Unlock address in lock
      calldata = ethers.utils.defaultAbiCoder.encode(
        ['address'],
        [unlockModified.address]
        )
    })

    it('reverts if the lock has already been upgraded to 13', async () => {
      await reverts(
        lock.migrate(calldata),
        'SCHEMA_VERSION_NOT_CORRECT'
      )
    })
  })
  
})