const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')

const { reverts } = require('../../helpers/errors')
const deployLocks = require('../../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../../helpers/constants')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../../helpers/truffle-artifacts')

let unlock
let locks

contract('Lock / erc721 / balanceOf', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
    locks = await deployLocks(unlock, accounts[0])
    await locks.FIRST.setMaxKeysPerAddress(10)
  })

  it('should fail if the user address is 0', async () => {
    await reverts(locks.FIRST.balanceOf(ADDRESS_ZERO), 'INVALID_ADDRESS')
  })

  it('should return 0 if the user has no key', async () => {
    const balance = new BigNumber(await locks.FIRST.balanceOf(accounts[3]))
    assert.equal(balance.toFixed(), 0)
  })

  it('should return correct number of keys', async () => {
    await locks.FIRST.purchase(
      [],
      [accounts[1], accounts[1], accounts[1]],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [[], [], []],
      {
        value: ethers.utils.parseUnits('0.03', 'ether'),
        from: accounts[1],
      }
    )
    const balance = new BigNumber(await locks.FIRST.balanceOf(accounts[1]))
    assert.equal(balance.toFixed(), 3)
  })

  it('should count only valid keys', async () => {
    const tx = await locks.FIRST.purchase(
      [],
      [accounts[1], accounts[1], accounts[1]],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [[], [], []],
      {
        value: ethers.utils.parseUnits('0.03', 'ether'),
        from: accounts[1],
      }
    )

    const tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)

    // expire all keys
    const expirationTs = await locks.FIRST.keyExpirationTimestampFor(
      tokenIds[0]
    )
    await time.increaseTo(expirationTs.toNumber() + 10)

    assert.equal((await locks.FIRST.balanceOf(accounts[1])).toNumber(), 0)

    // renew one
    await locks.FIRST.extend(0, tokenIds[0], ADDRESS_ZERO, [], {
      value: ethers.utils.parseUnits('0.03', 'ether'),
      from: accounts[1],
    })

    assert.equal((await locks.FIRST.balanceOf(accounts[1])).toNumber(), 1)
  })

  it('should return correct number after key transfers', async () => {
    await locks.FIRST.purchase(
      [],
      [accounts[6], accounts[6], accounts[6]],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO],
      [[], [], []],
      {
        value: ethers.utils.parseUnits('0.03', 'ether'),
        from: accounts[6],
      }
    )
    let tokenId = await locks.FIRST.tokenOfOwnerByIndex(accounts[6], 0)
    assert.equal(accounts[6], await locks.FIRST.ownerOf(tokenId))
    assert.equal((await locks.FIRST.balanceOf(accounts[6])).toNumber(), 3)
    await locks.FIRST.transferFrom(accounts[6], accounts[5], tokenId, {
      from: accounts[6],
    })
    let balanceOf6 = await locks.FIRST.balanceOf(accounts[6])
    let balanceOf5 = await locks.FIRST.balanceOf(accounts[5])
    assert.equal(balanceOf6.toNumber(), 2)
    assert.equal(balanceOf5.toNumber(), 1)
  })
})
