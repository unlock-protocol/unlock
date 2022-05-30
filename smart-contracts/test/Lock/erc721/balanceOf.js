const BigNumber = require('bignumber.js')

const { reverts } = require('../helpers/errors')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock
let locks

contract('Lock / erc721 / balanceOf', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    await locks.FIRST.setMaxKeysPerAddress(10)
  })

  it('should fail if the user address is 0', async () => {
    await reverts(
      locks.FIRST.balanceOf.call(web3.utils.padLeft(0, 40)),
      'INVALID_ADDRESS'
    )
  })

  it('should return 0 if the user has no key', async () => {
    const balance = new BigNumber(await locks.FIRST.balanceOf.call(accounts[3]))
    assert.equal(balance.toFixed(), 0)
  })

  it('should return correct number of keys', async () => {
    await locks.FIRST.purchase(
      [],
      [accounts[1], accounts[1], accounts[1]],
      [
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
      ],
      [
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
      ],
      [[], [], []],
      {
        value: web3.utils.toWei('0.03', 'ether'),
        from: accounts[1],
      }
    )
    const balance = new BigNumber(await locks.FIRST.balanceOf.call(accounts[1]))
    assert.equal(balance.toFixed(), 3)
  })

  it('should return correct number after key transfers', async () => {
    await locks.FIRST.purchase(
      [],
      [accounts[6], accounts[6], accounts[6]],
      [
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
      ],
      [
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
        web3.utils.padLeft(0, 40),
      ],
      [[], [], []],
      {
        value: web3.utils.toWei('0.03', 'ether'),
        from: accounts[6],
      }
    )
    let tokenId = await locks.FIRST.tokenOfOwnerByIndex.call(accounts[6], 0)
    assert.equal(accounts[6], await locks.FIRST.ownerOf(tokenId))
    assert.equal((await locks.FIRST.balanceOf.call(accounts[6])).toNumber(), 3)
    await locks.FIRST.transferFrom(accounts[6], accounts[5], tokenId, {
      from: accounts[6],
    })
    let balanceOf6 = await locks.FIRST.balanceOf.call(accounts[6])
    let balanceOf5 = await locks.FIRST.balanceOf.call(accounts[5])
    assert.equal(balanceOf6.toNumber(), 2)
    assert.equal(balanceOf5.toNumber(), 1)
  })
})
