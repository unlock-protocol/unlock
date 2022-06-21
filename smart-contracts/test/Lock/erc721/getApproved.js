const { reverts, deployLock } = require('../../helpers/errors')

contract('Lock / erc721 / getApproved', () => {
  let lock
  before(async () => {
    lock = await deployLock()
  })

  it('should fail if the key does not exist', async () => {
    await reverts(lock.getApproved(42), 'NO_SUCH_KEY')
  })
})
