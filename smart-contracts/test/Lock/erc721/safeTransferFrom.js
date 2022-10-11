const { deployLock, reverts, purchaseKey } = require('../../helpers')
const { ethers } = require('hardhat')

const TestERC721Recevier = artifacts.require('TestERC721Recevier')

let lock

contract('Lock / erc721 / safeTransferFrom', (accounts) => {
  // function safeTransferFrom() still uses transferFrom() under the hood
  // but adds an additional check afterwards. transferFrom is already well-tested,
  // so here we add a few checks to test only the new functionality.
  let tokenId
  const [, from, to] = accounts

  before(async () => {
    lock = await deployLock()
    await lock.updateTransferFee(0) // disable the transfer fee for this test

    // first, let's purchase a brand new key that we can transfer
    ;({ tokenId } = await purchaseKey(lock, from))
  })

  it('should work if no data is passed in', async () => {
    await lock.safeTransferFrom(from, to, tokenId, {
      from,
    })
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, to)
  })

  it('should work if some data is passed in', async () => {
    ;({ tokenId } = await purchaseKey(lock, accounts[7]))
    const method = 'safeTransferFrom(address,address,uint256,bytes)'
    await lock.methods[method](
      accounts[7],
      accounts[6],
      tokenId,
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Julien')),
      {
        from: accounts[7],
      }
    )
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, accounts[6])
    // while we may pass data to the safeTransferFrom function, it is not currently utilized in any way other than being passed to the `onERC721Received` function in MixinTransfer.sol
  })

  it('should fail if trying to transfer a key to a contract which does not implement onERC721Received', async () => {
    const { tokenId } = await purchaseKey(lock, accounts[5])

    // A contract which does NOT implement onERC721Received:
    const NonCompliantContract = artifacts.require('TestEventHooks')
    const { address } = await NonCompliantContract.new()

    await reverts(
      lock.safeTransferFrom(accounts[5], address, tokenId, {
        from: accounts[5],
      })
    )
    // make sure the key was not transferred
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, accounts[5])
  })

  it('should success to transfer when a contract implements onERC721Received', async () => {
    ;({ tokenId } = await purchaseKey(lock, accounts[7]))
    // A contract which does implement onERC721Received:
    let compliantContract = await TestERC721Recevier.new()

    await lock.safeTransferFrom(
      accounts[7],
      compliantContract.address,
      tokenId,
      {
        from: accounts[7],
      }
    )

    // make sure the key was not transferred
    let ownerOf = await lock.ownerOf(tokenId)
    assert.equal(ownerOf, compliantContract.address)
  })
})
