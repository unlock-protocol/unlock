const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')
const deployLocks = require('../test/helpers/deployLocks')
const Unlock = artifacts.require('Unlock.sol')

let unlock, lock

contract('Reports', (accounts) => {
  beforeEach(async () => {
    unlock = await Unlock.deployed()
    const locks = await deployLocks(unlock)
    lock = locks['FIRST']

    // First usage costs more, skip it
    await lock
      .purchaseFor(accounts[0], '', {
        value: Units.convert('0.01', 'eth', 'wei')
      })
  })

  it('gas usage report', async () => {
    let tx = await unlock.createLock(
      60 * 60 * 24 * 30, // expirationDuration: 30 days
      Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
      100 // maxNumberOfKeys
      , {
        from: accounts[0]
      })
    const createLock = new BigNumber(tx.receipt.gasUsed)

    tx = await lock
      .purchaseFor(accounts[1], '', {
        value: Units.convert('0.01', 'eth', 'wei')
      })
    const purchaseForNoData = new BigNumber(tx.receipt.gasUsed)

    tx = await lock
      .purchaseFor(accounts[2], Web3Utils.toHex('Julien'), {
        value: Units.convert('0.01', 'eth', 'wei')
      })
    const purchaseForWithData = new BigNumber(tx.receipt.gasUsed)

    tx = await lock.transferFrom(accounts[1], accounts[3],
      await lock.getTokenIdFor.call(accounts[1]), {
        from: accounts[1]
      })
    const transferFromNoData = new BigNumber(tx.receipt.gasUsed)

    tx = await lock.transferFrom(accounts[2], accounts[4],
      await lock.getTokenIdFor.call(accounts[2]), {
        from: accounts[2]
      })
    const transferFromWithData = new BigNumber(tx.receipt.gasUsed)

    console.log(`Gas Usage
  createLock: ${createLock.toFormat()}
  purchaseFor w/o Key data: ${purchaseForNoData.toFormat()}
  purchaseFor w/ Key data: ${purchaseForWithData.toFormat()}
  transferFrom w/o Key data: ${transferFromNoData.toFormat()}
  transferFrom w/ Key data: ${transferFromWithData.toFormat()}`
    )
  })
})
