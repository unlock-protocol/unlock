const { ADDRESS_ZERO, deployLock, reverts } = require('../helpers')

let lock
let lockSingleKey
let tokenId
let keyOwner
let receiver
let someone

contract('Lock / unlendKey', (accounts) => {
  keyOwner = accounts[1]
  someone = accounts[2] // the person who key is lended to
  receiver = accounts[3]

  beforeEach(async () => {
    lock = await deployLock()
    lockSingleKey = await deployLock({ name: 'SINGLE KEY' })
    await lock.updateTransferFee(0) // disable the lend fee for this test
    await lockSingleKey.updateTransferFee(0) // disable the lend fee for this test

    const tx = await lock.purchase(
      [],
      [keyOwner],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: await lock.keyPrice(),
        from: keyOwner,
      }
    )

    const tokenIds = tx.logs
      .filter((v) => v.event === 'Transfer')
      .map(({ args }) => args.tokenId)
    tokenId = tokenIds[0]

    // lend a key to someone
    await lock.lendKey(keyOwner, someone, tokenId, {
      from: keyOwner,
    })
  })

  describe('failures', () => {
    it('should abort when there is no key to lend', async () => {
      await reverts(lock.unlendKey(receiver, 999), 'KEY_NOT_VALID')
    })

    it('should abort when caller is not a key manager', async () => {
      await reverts(
        lock.unlendKey(receiver, tokenId, { from: accounts[9] }),
        'UNAUTHORIZED'
      )
    })

    it('should abort when caller is the account that currently owns the key', async () => {
      await reverts(
        lock.unlendKey(receiver, tokenId, { from: receiver }),
        'UNAUTHORIZED'
      )
    })
  })

  describe('when caller is the key manager', () => {
    beforeEach(async () => {
      await lock.unlendKey(receiver, tokenId, { from: keyOwner })
    })

    it('transfer ownership back to the specified recipient', async () => {
      assert.equal(await lock.ownerOf(tokenId), receiver)
    })

    it('update key validity properly', async () => {
      assert.equal(await lock.getHasValidKey(someone), false)
      assert.equal(await lock.getHasValidKey(receiver), true)
    })

    it('retains the correct key manager', async () => {
      assert.equal(await lock.keyManagerOf(tokenId), keyOwner)
    })
  })
})
