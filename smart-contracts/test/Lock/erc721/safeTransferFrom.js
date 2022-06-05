const { reverts } = require('../../helpers/errors')
const deployLocks = require('../../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../../helpers/constants')
const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

const TestERC721Recevier = artifacts.require('TestERC721Recevier')

let unlock
let lock

contract('Lock / erc721 / safeTransferFrom', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
    await lock.updateTransferFee(0) // disable the transfer fee for this test
  })

  // function safeTransferFrom() still uses transferFrom() under the hood, but adds an additional check afterwards. transferFrom is already well-tested, so here we add a few checks to test only the new functionality.
  const from = accounts[1]
  const to = accounts[2]
  let tokenId

  before(async () => {
    // first, let's purchase a brand new key that we can transfer
    const tx = await lock.purchase(
      [],
      [from],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: web3.utils.toWei('0.01', 'ether'),
        from,
      }
    )

    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    tokenId = args.tokenId
  })

  it('should work if no data is passed in', async () => {
    await lock.safeTransferFrom(from, to, tokenId, {
      from,
    })
    let ownerOf = await lock.ownerOf.call(tokenId)
    assert.equal(ownerOf, to)
  })

  it('should work if some data is passed in', async () => {
    const tx = await lock.purchase(
      [],
      [accounts[7]],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: web3.utils.toWei('0.01', 'ether'),
        from: accounts[7],
      }
    )
    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    tokenId = args.tokenId
    const method = 'safeTransferFrom(address,address,uint256,bytes)'
    await lock.methods[method](
      accounts[7],
      accounts[6],
      tokenId,
      web3.utils.toHex('Julien'),
      {
        from: accounts[7],
      }
    )
    let ownerOf = await lock.ownerOf.call(tokenId)
    assert.equal(ownerOf, accounts[6])
    // while we may pass data to the safeTransferFrom function, it is not currently utilized in any way other than being passed to the `onERC721Received` function in MixinTransfer.sol
  })

  it('should fail if trying to transfer a key to a contract which does not implement onERC721Received', async () => {
    const tx = await lock.purchase(
      [],
      [accounts[5]],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: web3.utils.toWei('0.01', 'ether'),
        from: accounts[5],
      }
    )
    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    tokenId = args.tokenId
    // A contract which does NOT implement onERC721Received:
    let nonCompliantContract = unlock.address
    await reverts(
      lock.safeTransferFrom(accounts[5], nonCompliantContract, tokenId, {
        from: accounts[5],
      })
    )
    // make sure the key was not transferred
    let ownerOf = await lock.ownerOf.call(tokenId)
    assert.equal(ownerOf, accounts[5])
  })

  it('should success to transfer when a contract implements onERC721Received', async () => {
    const tx = await lock.purchase(
      [],
      [accounts[7]],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: web3.utils.toWei('0.01', 'ether'),
        from: accounts[5],
      }
    )
    const { args } = tx.logs.find((v) => v.event === 'Transfer')
    tokenId = args.tokenId
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
    let ownerOf = await lock.ownerOf.call(tokenId)
    assert.equal(ownerOf, compliantContract.address)
  })
})
