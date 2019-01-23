const Units = require('ethereumjs-units')
const Unlock = artifacts.require('../Unlock.sol')

contract('PublicLock', accounts => {
  describe('createLock with excessive expirationDuration', function () {
    let unlock
    // set duration to be > 100 years
    const excessiveDuration = 3153600000 + 1

    before(async () => {
      unlock = await Unlock.deployed()
    })

    it('should fail to create a lock with an excessive expirationDuration', async function () {
      try {
        await unlock.createLock(
          excessiveDuration, // expirationDuration: 30 days
          Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
          100 // maxNumberOfKeys
          , {
            from: accounts[0]
          })
      } catch (error) {
        assert.equal(error.message, 'VM Exception while processing transaction: revert Expiration Duration exceeds 100 years')
        return
      }
      assert.fail('Should have failed')
    })
  })
})
