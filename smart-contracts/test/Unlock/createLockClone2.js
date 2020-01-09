const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const unlockContract = artifacts.require('Unlock.sol')
const PublicLock = artifacts.require('./PublicLock.sol')
const { utils } = require('hardlydifficult-ethereum-contracts')
const truffleAssert = require('truffle-assertions')
const getProxy = require('../helpers/proxy')

let unlock
let lock
let templateAddress

contract('Unlock / createLockClone2', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)
    templateAddress = await unlock.publicLockAddress()
  })

  describe('Deploy with Clone 2 with various salts', () => {
    const testSalts = [
      '0x000000000000000000000000',
      '0x000000000000000000000001',
      '0x000000000000000000000002',
      '0xffffffffffffffffffffffff',
      '0xefffffffffffffffffffffff',
      '0xdfffffffffffffffffffffff',
      '0x0000000000f0000000000000',
      '0x0000000000e0000000000000',
    ]
    for (let i = 0; i < testSalts.length; i++) {
      const salt = testSalts[i]

      describe(`Salt: ${salt}`, () => {
        before(async () => {
          let tx = await unlock.createLock(
            60 * 60 * 24 * 30, // expirationDuration: 30 days
            Web3Utils.padLeft(0, 40),
            Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
            100, // maxNumberOfKeys
            'Test Lock',
            salt,
            {
              from: accounts[0],
            }
          )
          const evt = tx.logs.find(v => v.event === 'NewLock')
          lock = await PublicLock.at(evt.args.newLockAddress)
        })

        it('Can read from the lock', async () => {
          const result = await lock.expirationDuration()
          assert.notEqual(result, '0')
        })

        it('Matches the JS calculated address', async () => {
          const address = await utils.create2.buildClone2Address(
            unlock.address,
            templateAddress,
            accounts[0],
            salt
          )
          assert.equal(address, lock.address)
        })

        it('Should fail if a salt is re-used', async () => {
          await truffleAssert.reverts(
            unlock.createLock(
              60 * 60 * 24 * 30, // expirationDuration: 30 days
              Web3Utils.padLeft(0, 40),
              Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
              100, // maxNumberOfKeys
              'Test Lock',
              salt,
              {
                from: accounts[0],
              }
            ),
            'PROXY_DEPLOY_FAILED'
          )
        })

        it('Can use the same salt if the account is different', async () => {
          await unlock.createLock(
            60 * 60 * 24 * 30, // expirationDuration: 30 days
            Web3Utils.padLeft(0, 40),
            Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
            100, // maxNumberOfKeys
            'Test Lock',
            salt,
            {
              from: accounts[1],
            }
          )
        })
      })
    }
  })
})
