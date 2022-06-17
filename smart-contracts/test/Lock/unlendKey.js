const { reverts } = require('../helpers/errors')
const deployLocks = require('../helpers/deployLocks')
const { ADDRESS_ZERO } = require('../helpers/constants')
const getContractInstance = require('../helpers/truffle-artifacts')
const unlockContract = artifacts.require('Unlock.sol')

let unlock
let locks
let tokenId
let keyOwner
let receiver
let someone

contract('Lock / unlendKey', (accounts) => {
  before(async () => {
    unlock = await getContractInstance(unlockContract)
  })

  const deployer = accounts[0]
  keyOwner = accounts[1]
  someone = accounts[2] // the person who key is lended to
  receiver = accounts[3]

  beforeEach(async () => {
    locks = await deployLocks(unlock, deployer)
    await locks.FIRST.updateTransferFee(0) // disable the lend fee for this test
    await locks['SINGLE KEY'].updateTransferFee(0) // disable the lend fee for this test

    const tx = await locks.FIRST.purchase(
      [],
      [keyOwner],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: await locks.FIRST.keyPrice(),
        from: deployer,
      }
    )

    const tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
    tokenId = tokenIds[0]

    // lend a key to someone
    await locks.FIRST.lendKey(keyOwner, someone, tokenId, {
      from: keyOwner,
    })
  })

  describe('failures', () => {
    it('should abort when there is no key to lend', async () => {
      await reverts(locks.FIRST.unlendKey(receiver, 999), 'KEY_NOT_VALID')
    })

    it('should abort when caller is not a key manager', async () => {
      await reverts(
        locks.FIRST.unlendKey(receiver, tokenId, { from: accounts[9] }),
        'UNAUTHORIZED'
      )
    })

    it('should abort when caller is the account that currently owns the key', async () => {
      await reverts(
        locks.FIRST.unlendKey(receiver, tokenId, { from: receiver }),
        'UNAUTHORIZED'
      )
    })
  })

  describe('when caller is the key manager', () => {
    beforeEach(async () => {
      await locks.FIRST.unlendKey(receiver, tokenId, { from: keyOwner })
    })

    it('transfer ownership back to the specified recipient', async () => {
      assert.equal(await locks.FIRST.ownerOf(tokenId), receiver)
    })

    it('update key validity properly', async () => {
      assert.equal(await locks.FIRST.getHasValidKey(someone), false)
      assert.equal(await locks.FIRST.getHasValidKey(receiver), true)
    })

    it('retains the correct key manager', async () => {
      assert.equal(await locks.FIRST.keyManagerOf(tokenId), keyOwner)
    })
  })
})
