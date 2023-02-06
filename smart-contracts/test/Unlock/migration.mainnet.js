/**
 * To run this you will need to
 * 
 * 1. start a mainnet fork node 
 * RUN_FORK=1 yarn hardhat node 
 * 
 * 2. deploy the new unlock
 * CHAIN_ID=1 yarn hardhat deploy:unlock --network localhost
 * 
 * 3. copy/paste the newly deployed Unlock address in 2 places:
 * - below in  NEW_UNLOCK_ADDRESS
 * - in `contracts/mixins/MixinKeys.sol` in the `migrate()` (l. ~174)
 * 
 * 4. run this file against the node 
 * CHAIN_ID=1 yarn hardhat test test/Unlock/migration.mainnet.js --network localhost
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
} = require('../helpers')

const { submitTx } = require('../../scripts/multisig')

const NEW_UNLOCK_ADDRESS = '0xBe51dc0408040B7f27525352D35ec57558B1dFEe'

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

    // deploy new template
    const PublicLockV13 = await ethers.getContractFactory('PublicLock')
    publicLock = await PublicLockV13.deploy()
    await publicLock.deployed()
    console.log(`PublicLockV13 > deployed at ${publicLock.address}`)
    
    // redeploy new Unlock
    unlockModified = await ethers.getContractAt('Unlock', NEW_UNLOCK_ADDRESS);
    
    // create a (v12) lock
    lock = await deployLock({ unlock, isEthers: true })
    
    // purchase a key
    await purchaseKey(lock, keyOwner.address)

    // impersonate one of the multisig owner
    const multisigSigner = await impersonate(MULTISIG_ADDRESS_OWNER);
    
    // submit the new tempalte in old unlock (using multisig)
    const addLockTemplateTx = {
      contractName: 'Unlock',
      contractAddress: UNLOCK_ADDRESS,
      functionName: 'addLockTemplate',
      functionArgs: [publicLock.address, 13],
    }
    const txId = await submitTx({
      tx: addLockTemplateTx,
      safeAddress: UNLOCK_MULTISIG_ADDRESS,
      signer: multisigSigner,
    })

    // set the new tempalte as default in old unlock (using multisig)
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

    await confirmMultisigTx({ transactionId: txId })
    await confirmMultisigTx({ transactionId: txId2 })

    console.log(`UNLOCK (old) > upgraded template to ${await unlock.publicLockLatestVersion()}`)
  })

  describe('Old Unlock settings', () => {
    it('correct v13 template', async () => {
      expect(await unlock.publicLockAddress()).to.equals(publicLock.address)
      expect(await unlock.publicLockLatestVersion()).to.equals(13)
    })
  })

  describe('Lock upgrade', () => {
    before(async () => {
      expect(await lock.publicLockVersion()).to.equals(12)
      // upgrade the lock
      await unlock.upgradeLock(lock.address, 13)
      console.log(`Unlock (old) > lock upgraded to v${13}`)
    })
    it('upgrade version correctly', async () => {
      expect(await lock.publicLockVersion()).to.equals(13)
    })
    it('show previous unlock address', async () => {
      expect(await lock.unlockProtocol()).to.equals(unlock.address)
    })
    it('unlock has lock info', async () => {
      const lockBalance = await unlock.locks(lock.address)
      expect(lockBalance.deployed).to.equals(true)
      expect(lockBalance.totalSales.toString()).to.equals((await lock.keyPrice()).toString())
      expect(lockBalance.yieldedDiscountTokens.toNumber()).to.equals(0)
    })
  })

  describe('Migrate lock', () => {
    before(async () => {
      // set new Unlock address in lock
      const calldata = ethers.utils.defaultAbiCoder.encode(
        ['address'],
        [unlockModified.address]
        )
      await lock.migrate(calldata)
    })
    it('lock has updated unlock address', async () => {
      expect(await lock.unlockProtocol()).to.equals(unlockModified.address)
    })
    
    it('new unlock has lock info', async () => {
      const lockBalance = await unlockModified.locks(lock.address)
      expect(lockBalance.deployed).to.equals(true)
      expect(lockBalance.totalSales.toString()).to.equals((await lock.keyPrice()).toString())
      expect(lockBalance.yieldedDiscountTokens.toNumber()).to.equals(0)
    })
  })
  
})