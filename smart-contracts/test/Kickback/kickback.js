const { StandardMerkleTree } = require('@openzeppelin/merkle-tree')
const { ethers, upgrades } = require('hardhat')
const { assert } = require('chai')
const {
  reverts,
  deployContracts,
  deployLock,
  purchaseKeys,
  LOCK_MANAGER_ROLE,
} = require('../helpers')

describe('Kickback contract', () => {
  let kickback
  let keyOwners
  let lock
  let tree
  let refundAmount
  before(async () => {
    const [deployer] = await ethers.getSigners()

    // deploy unlock
    const { unlock } = await deployContracts()

    // create a new lock
    lock = await deployLock()
    const result = await purchaseKeys(lock, 5)
    keyOwners = result.keyOwners

    // Deploy upgradable KeyManager
    const Kickback = await ethers.getContractFactory(
      'contracts/utils/Kickback.sol:Kickback'
    )
    kickback = await upgrades.deployProxy(Kickback, [])

    refundAmount = await lock.keyPrice()

    tree = StandardMerkleTree.of(
      keyOwners.map((recipient) => [recipient, refundAmount.toString()]),
      ['address', 'uint256']
    )
  })

  describe('approveRefunds', () => {
    it('should revert if the Kickback contract is not a lock manager', async () => {
      await reverts(
        kickback.approveRefunds(lock, tree.root),
        `VM Exception while processing transaction: reverted with reason string 'Add the Kickback contract as a lock manager first.'`
      )
    })
    it('should fail if callers is not a lock manager', async () => {
      const [, _randomSigner] = await ethers.getSigners()

      await lock.grantRole(LOCK_MANAGER_ROLE, await kickback.getAddress())
      await reverts(
        kickback.connect(_randomSigner).approveRefunds(lock, tree.root),
        `VM Exception while processing transaction: reverted with reason string 'You must be a lock manager to approve refunds.'`
      )
    })
    it('should store the root of the merkle tree', async () => {
      const lockAddress = (await lock.getAddress()).toLowerCase()
      await lock.grantRole(LOCK_MANAGER_ROLE, await kickback.getAddress())
      await kickback.approveRefunds(lockAddress, tree.root)
      assert.equal(await kickback.roots(lockAddress), tree.root)
    })
  })

  describe('refund', () => {
    let proof
    beforeEach(async () => {
      await lock.grantRole(LOCK_MANAGER_ROLE, await kickback.getAddress())
      await kickback.approveRefunds(lock, tree.root)
      for (const [i, v] of tree.entries()) {
        if (v[0] === keyOwners[0]) {
          proof = tree.getProof(i)
        }
      }
    })

    it('should fail if the proof is invalid because the recipient is not in the list of recipients', async () => {
      const [, , , , , , , _randomSigner] = await ethers.getSigners()
      assert(keyOwners.indexOf(_randomSigner.address) === -1)
      await reverts(
        kickback.connect(_randomSigner).refund(lock, proof, refundAmount),
        "VM Exception while processing transaction: reverted with reason string 'Invalid proof'"
      )
    })
    it('should fail if the proof is invalid because the amount is incorrect', async () => {
      const [refundedUser] = await ethers.getSigners()
      await reverts(
        kickback.connect(refundedUser).refund(lock, proof, refundAmount * 2n),
        "VM Exception while processing transaction: reverted with reason string 'Invalid proof'"
      )
    })
    it('should fail if the refund was already claimed', async () => {
      const [, refundedUser] = await ethers.getSigners()
      let proof
      const refundedUserAddress = await refundedUser.getAddress()
      for (const [i, v] of tree.entries()) {
        if (v[0] === refundedUserAddress) {
          proof = tree.getProof(i)
        }
      }
      await kickback.connect(refundedUser).refund(lock, proof, refundAmount)
      await reverts(
        kickback.connect(refundedUser).refund(lock, proof, refundAmount),
        "VM Exception while processing transaction: reverted with reason string 'Refund already issued'"
      )
    })
    it('should withdraw funds for the user', async () => {
      const [, , refundedUser] = await ethers.getSigners()
      let proof
      const refundedUserAddress = await refundedUser.getAddress()
      for (const [i, v] of tree.entries()) {
        if (v[0] === refundedUserAddress) {
          proof = tree.getProof(i)
        }
      }
      const balanceBefore =
        await ethers.provider.getBalance(refundedUserAddress)
      await kickback.connect(refundedUser).refund(lock, proof, refundAmount)
      const balanceAfter = await ethers.provider.getBalance(refundedUserAddress)
      assert(balanceBefore < balanceAfter)
    })
  })
})
