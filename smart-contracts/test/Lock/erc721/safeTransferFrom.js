const assert = require('assert')
const { deployLock, reverts, purchaseKey } = require('../../helpers')
const { ethers } = require('hardhat')

let lock
let from, to, random, random2, random3

const safeTransferFromSig = 'safeTransferFrom(address,address,uint256)'
const safeTransferFromWithDataSig =
  'safeTransferFrom(address,address,uint256,bytes)'

describe('Lock / erc721 / safeTransferFrom', () => {
  // function safeTransferFrom() still uses transferFrom() under the hood
  // but adds an additional check afterwards transferFrom is already well-tested,
  // so here we add a few checks to test only the new functionality.
  let tokenId

  before(async () => {
    ;[, from, to, random, random2, random3] = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    // first, let's purchase a brand new key that we can transfer
    ;({ tokenId } = await purchaseKey(lock, await from.getAddress()))
  })

  it('should work if no data is passed in', async () => {
    await lock
      .connect(from)
      [
        safeTransferFromSig
      ](await from.getAddress(), await to.getAddress(), tokenId)
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, await to.getAddress())
  })

  it('should work if some data is passed in', async () => {
    ;({ tokenId } = await purchaseKey(lock, await random.getAddress()))
    await lock
      .connect(random)
      [
        safeTransferFromWithDataSig
      ](await random.getAddress(), await random2.getAddress(), tokenId, ethers.hexlify(ethers.toUtf8Bytes('Julien')))
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, await random2.getAddress())
    // while we may pass data to the safeTransferFrom function, it is not currently
    // utilized in any way other than being passed to the `onERC721Received` function
    // in MixinTransfer.sol
  })

  it('should fail if trying to transfer a key to a contract which does not implement onERC721Received', async () => {
    const { tokenId } = await purchaseKey(lock, await random.getAddress())

    // A contract which does NOT implement onERC721Received:
    const NonCompliantContract =
      await ethers.getContractFactory('TestEventHooks')
    const { address } = await NonCompliantContract.deploy()

    await reverts(
      lock
        .connect(random)
        [safeTransferFromSig](await random.getAddress(), address, tokenId)
    )
    // make sure the key was not transferred
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, await random.getAddress())
  })

  it('should success to transfer when a contract implements onERC721Received', async () => {
    ;({ tokenId } = await purchaseKey(lock, await random3.getAddress()))
    // A contract which does implement onERC721Received:
    const TestERC721Recevier =
      await ethers.getContractFactory('TestERC721Recevier')
    let compliantContract = await TestERC721Recevier.deploy()

    await lock
      .connect(random3)
      [
        safeTransferFromSig
      ](await random3.getAddress(), await compliantContract.getAddress(), tokenId)

    // make sure the key was not transferred
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, await compliantContract.getAddress())
  })
})
