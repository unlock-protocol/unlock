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

const NEW_UNLOCK_ADDRESS = '0xe79B93f8E22676774F2A8dAd469175ebd00029FA'

let unlock, publicLock, unlockModified, lock, signer, keyOwner

describe(`Unlock postLockUpgrade attack`, function() {
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
    const UnlockAttack = await ethers.getContractFactory('UnlockAttack')
    const unlockAttack = await UnlockAttack.deploy()
    console.log(unlockAttack)
    await unlockAttack.setup()
    // unlock = await ethers.getContractAt('Unlock', UNLOCK_ADDRESS)


  
    // impersonate one of the multisig owner
    // const multisigSigner = await impersonate(MULTISIG_ADDRESS_OWNER);

    // // deploy new template
    // const PublicLockV13 = await ethers.getContractFactory('PublicLock')
    // publicLock = await PublicLockV13.deploy()
    // await publicLock.deployed()
    // console.log(`PublicLockV13 > deployed at ${publicLock.address}`)

    // // submit the new tempalte in old unlock (using multisig)
    // const addLockTemplateTx = {
    //   contractName: 'Unlock',
    //   contractAddress: UNLOCK_ADDRESS,
    //   functionName: 'addLockTemplate',
    //   functionArgs: [publicLock.address, 13],
    // }

    // const txIdv13 = await submitTx({
    //   tx: addLockTemplateTx,
    //   safeAddress: UNLOCK_MULTISIG_ADDRESS,
    //   signer: multisigSigner,
    // })

    // await confirmMultisigTx({ transactionId: txIdv13 })
  })

  it('works', async () => {

  })
})