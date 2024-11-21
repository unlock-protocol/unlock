const { StandardMerkleTree } = require('@openzeppelin/merkle-tree')
const assert = require('assert')
const { ethers } = require('hardhat')
const { reverts, deployLock } = require('../../helpers')

describe('AllowListHook', function () {
  it('should work as a hook', async function () {
    const [user, another, third] = await ethers.getSigners()

    const AllowListHook = await ethers.getContractFactory('AllowListHook')
    const hook = await AllowListHook.deploy()
    const lock = await deployLock({
      name: 'FREE',
    })

    const tree = StandardMerkleTree.of(
      [
        [await user.getAddress(), '1'],
        ...Array(200).fill([
          await ethers.Wallet.createRandom().getAddress(),
          '1',
        ]),
        [await another.getAddress(), '1'],
        [await third.getAddress(), '1'],
      ],
      ['address', 'uint256']
    )

    // Set the hook on contract
    await (
      await lock.setEventHooks(
        await hook.getAddress(),
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress
      )
    ).wait()

    await hook.setMerkleRootForLock(await lock.getAddress(), tree.root)
    const purchaserAddress = await user.getAddress()

    // Let's make sure we cannot purchase a key without a valid proof
    await reverts(
      lock.purchase(
        [0],
        [purchaserAddress],
        [purchaserAddress],
        [purchaserAddress],
        ['0x']
      ),
      'NOT_AUTHORIZED()'
    )

    // Let's make sure we cannot purchase a key with another valid proof
    let proof
    const anotherPurchaserAddress = await another.getAddress()
    for (const [i, v] of tree.entries()) {
      if (v[0] === anotherPurchaserAddress) {
        proof = `0x${tree
          .getProof(i)
          .map((p) => p.slice(2))
          .join('')}`
      }
    }

    await reverts(
      lock.purchase(
        [0],
        [purchaserAddress],
        [purchaserAddress],
        [purchaserAddress],
        [proof]
      ),
      'NOT_AUTHORIZED()'
    )

    for (const [i, v] of tree.entries()) {
      if (v[0] === purchaserAddress) {
        proof = `0x${tree
          .getProof(i)
          .map((p) => p.slice(2))
          .join('')}`
      }
    }

    // Let's now purchase a key!
    const tx = await lock.purchase(
      [0],
      [purchaserAddress],
      [purchaserAddress],
      [purchaserAddress],
      [proof]
    )
    const receipt = await tx.wait()
  })
})
