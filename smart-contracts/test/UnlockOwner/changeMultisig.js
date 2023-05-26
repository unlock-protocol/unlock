const { assert } = require('chai')
const { ethers } = require('hardhat')

const { reverts, ADDRESS_ZERO } = require('../helpers')

let bridge, daoTimelock, multisig, multisig2, unlock, unlockOwner

const destDomainId = 1734439522

contract('UnlockOwner / change multisig', () => {
  before(async () => {
    ;[, bridge, unlock, daoTimelock, multisig, multisig2] =
      await ethers.getSigners()

    // deploy unlock manager on remote chain
    const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
    const { chainId } = await ethers.provider.getNetwork()

    unlockOwner = await UnlockOwner.deploy(
      bridge.address, // bridge
      unlock.address, // unlock
      daoTimelock.address, // timelockDao
      multisig.address, // multisig
      destDomainId, // domain,
      chainId // daoChainId
    )
  })

  describe('changeMultisig', () => {
    it('can only be called by the multisig itself', async () => {
      await reverts(unlockOwner.changeMultisig(ADDRESS_ZERO), 'Unauthorized')
    })

    it('allow the multisig to replace itself', async () => {
      await unlockOwner.connect(multisig).changeMultisig(multisig2.address)
      assert.equal(await unlockOwner.multisig(), multisig2.address)
    })

    it('allow the multisig to remove itself', async () => {
      await unlockOwner.connect(multisig2).changeMultisig(ADDRESS_ZERO)
      assert.equal(await unlockOwner.multisig(), ADDRESS_ZERO)

      // make sure exec reverts
      const calldata = ethers.utils.defaultAbiCoder.encode(
        ['uint8', 'bytes'],
        [2, '0x']
      )
      await reverts(
        unlockOwner.connect(multisig2).execMultisig(calldata),
        'Unauthorized'
      )
    })
  })
})
