const { assert } = require('chai')
const { deployLock, reverts, purchaseKey } = require('../../helpers')
const { ethers } = require('hardhat')

let lock
let from, to, random, random2, random3

const safeTransferFromSig = 'safeTransferFrom(address,address,uint256)'
const safeTransferFromWithDataSig =
  'safeTransferFrom(address,address,uint256,bytes)'

describe('Lock / erc721 / safeTransferFrom', () => {
  // function safeTransferFrom() still uses transferFrom() under the hood
  // but adds an additional check afterwards. transferFrom is already well-tested,
  // so here we add a few checks to test only the new functionality.
  let tokenId

  before(async () => {
    ;[, from, to, random, random2, random3] = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    // first, let's purchase a brand new key that we can transfer
    ;({ tokenId } = await purchaseKey(lock, from.address))
  })

  it('should work if no data is passed in', async () => {
    await lock
      .connect(from)
      [safeTransferFromSig](from.address, to.address, tokenId)
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, to.address)
  })

  it('should work if some data is passed in', async () => {
    ;({ tokenId } = await purchaseKey(lock, random.address))
    await lock
      .connect(random)
      [safeTransferFromWithDataSig](
        random.address,
        random2.address,
        tokenId,
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Julien'))
      )
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, random2.address)
    // while we may pass data to the safeTransferFrom function, it is not currently
    // utilized in any way other than being passed to the `onERC721Received` function
    // in MixinTransfer.sol
  })

  it('should fail if trying to transfer a key to a contract which does not implement onERC721Received', async () => {
    const { tokenId } = await purchaseKey(lock, random.address)

    // A contract which does NOT implement onERC721Received:
    const NonCompliantContract = await ethers.getContractFactory(
      'TestEventHooks'
    )
    const { address } = await NonCompliantContract.deploy()

    await reverts(
      lock
        .connect(random)
        [safeTransferFromSig](random.address, address, tokenId)
    )
    // make sure the key was not transferred
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, random.address)
  })

  it('should success to transfer when a contract implements onERC721Received', async () => {
    ;({ tokenId } = await purchaseKey(lock, random3.address))
    // A contract which does implement onERC721Received:
    const TestERC721Recevier = await ethers.getContractFactory(
      'TestERC721Recevier'
    )
    let compliantContract = await TestERC721Recevier.deploy()

    await lock
      .connect(random3)
      [safeTransferFromSig](random3.address, compliantContract.address, tokenId)

    // make sure the key was not transferred
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, compliantContract.address)
  })
})
