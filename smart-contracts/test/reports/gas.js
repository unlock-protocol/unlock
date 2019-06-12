const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')
const deployLocks = require('../helpers/deployLocks')
const getUnlockProxy = require('../helpers/proxy')
const LockApi = require('../helpers/lockApi')

const TestErc20Token = artifacts.require('TestErc20Token.sol')

const Unlock = artifacts.require('Unlock.sol')

let unlock, locks, lock, lockErc20, token, lockApi

contract('reports / gas', accounts => {
  beforeEach(async () => {
    unlock = await getUnlockProxy(Unlock)
    locks = await deployLocks(unlock, accounts[0])
    lock = locks['FIRST']
    token = await TestErc20Token.new()
    // Mint one token so it appears to be a valid ERC20
    await token.mint(accounts[0], 1)

    const locksErc20 = await deployLocks(unlock, accounts[0], token.address)
    lockErc20 = locksErc20['FIRST']
    for (let i = 0; i < 10; i++) {
      await token.mint(accounts[i], '1000000000000000000000000000000000', {
        from: accounts[0],
      })
      await token.approve(lockErc20.address, -1, { from: accounts[i] })
    }
    lockApi = new LockApi(lockErc20)

    // First usage costs more, skip it
    await lock.purchaseFor(accounts[0], {
      value: Units.convert('0.01', 'eth', 'wei'),
    })
    await lockApi.purchaseFor(accounts[0])
    await lock.purchaseFor(accounts[9], {
      value: Units.convert('0.01', 'eth', 'wei'),
    })
    await lockApi.purchaseFor(accounts[9])
  })

  it('gas usage report', async () => {
    const approve = await getGasFor(
      lock.approve(accounts[5], await lock.getTokenIdFor(accounts[0]))
    )
    const createLock = await getGasFor(
      unlock.createLock(
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        Web3Utils.padLeft(0, 40),
        Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
        100, // maxNumberOfKeys
        'Gas Test Lock',
        {
          from: accounts[0],
        }
      )
    )

    const purchaseForEth = await getGasFor(
      lock.purchaseFor(accounts[2], {
        value: Units.convert('0.01', 'eth', 'wei'),
      })
    )
    const purchaseForErc20 = await getGasFor(lockApi.purchaseFor(accounts[2]))
    const purchaseForFromEth = await getGasFor(
      lock.purchaseForFrom(accounts[7], accounts[2], {
        value: Units.convert('0.01', 'eth', 'wei'),
      })
    )
    const purchaseForFromErc20 = await getGasFor(
      lockApi.purchaseForFrom(accounts[7], accounts[2])
    )

    const setApprovalForAll = await getGasFor(
      lock.setApprovalForAll(accounts[1], true)
    )

    // Turn on fees before the transfer tests
    const updateTransferFee = await getGasFor(lock.updateTransferFee(1, 10))
    const updateRefundPenalty = await getGasFor(lock.updateRefundPenalty(1, 10))
    await lockErc20.updateTransferFee(1, 10)
    await lockErc20.updateRefundPenalty(1, 10)

    const estimatedTransferFee = await lock.getTransferFee.call(accounts[2])
    const transferFromEth = await getGasFor(
      lock.transferFrom(
        accounts[2],
        accounts[4],
        await lock.getTokenIdFor.call(accounts[2]),
        {
          from: accounts[2],
          value: estimatedTransferFee,
        }
      )
    )
    const transferFromErc20 = await getGasFor(
      lockApi.transferFrom(
        accounts[2],
        accounts[4],
        (await lockErc20.getTokenIdFor.call(accounts[2])).toString(),
        estimatedTransferFee,
        accounts[2]
      )
    )

    const safeTransferFromErc20 = await getGasFor(
      lockApi.safeTransferFrom(
        accounts[4],
        accounts[2],
        (await lockErc20.getTokenIdFor.call(accounts[4])).toString(),
        estimatedTransferFee,
        accounts[4]
      )
    )
    const safeTransferFromEth = await getGasFor(
      lock.safeTransferFrom(
        accounts[4],
        accounts[2],
        await lock.getTokenIdFor.call(accounts[4]),
        {
          from: accounts[4],
          value: estimatedTransferFee,
        }
      )
    )
    const cancelAndRefundEth = await getGasFor(
      lock.cancelAndRefund({ from: accounts[7] })
    )
    const cancelAndRefundErc20 = await getGasFor(
      lockApi.cancelAndRefund(accounts[7])
    )

    const expireKeyFor = await getGasFor(lock.expireKeyFor(accounts[9]))

    const updateKeyPrice = await getGasFor(lock.updateKeyPrice(12))

    const grantKeys = await getGasFor(
      lock.grantKeys([accounts[5], accounts[6]], [9999999999])
    )

    // Put some more money back in
    await lock.purchaseFor(accounts[1], {
      value: Units.convert('0.01', 'eth', 'wei'),
    })
    await lockApi.purchaseFor(accounts[1])

    const withdrawEth = await getGasFor(lock.withdraw(0))
    const withdrawErc20 = await getGasFor(lockApi.withdraw(0, accounts[0]))

    const updateLockName = await getGasFor(lock.updateLockName('Unlock Blog'))

    // Put some more money back in
    await lock.purchaseFor(accounts[0], {
      value: Units.convert('0.01', 'eth', 'wei'),
    })
    await lockApi.purchaseFor(accounts[0])

    const disableLock = await getGasFor(lock.disableLock())
    await lockErc20.disableLock()

    const destroyLockEth = await getGasFor(lock.destroyLock())
    const destroyLockErc20 = await getGasFor(lockApi.destroyLock(accounts[0]))

    const transferOwnership = await getGasFor(
      locks['SECOND'].transferOwnership(accounts[2])
    )
    const renounceOwnership = await getGasFor(
      locks['SECOND'].renounceOwnership({ from: accounts[2] })
    )

    const setGlobalBaseTokenURI = await getGasFor(
      unlock.setGlobalBaseTokenURI(
        'https://locksmith.unlock-protocol.com/api/key/'
      )
    )
    const setGlobalTokenSymbol = await getGasFor(
      unlock.setGlobalTokenSymbol('KEY')
    )

    // eslint-disable-next-line no-console
    console.log(`Gas Usage (slightly more gas may be required than what you see below)
  Key owner functions
    approve: ${approve.toFormat()}
    cancelAndRefund: ${cancelAndRefundEth.toFormat()} ETH / ${cancelAndRefundErc20.toFormat()} ERC20
    purchaseFor: ${purchaseForEth.toFormat()} ETH / ${purchaseForErc20.toFormat()} ERC20
    purchaseForFrom: ${purchaseForFromEth.toFormat()} ETH / ${purchaseForFromErc20.toFormat()} ERC20
    safeTransferFrom: ${safeTransferFromEth.toFormat()} ETH / ${safeTransferFromErc20.toFormat()} ERC20
    setApprovalForAll: ${setApprovalForAll.toFormat()}
    transferFrom: ${transferFromEth.toFormat()} ETH / ${transferFromErc20.toFormat()} ERC20
  Lock owner functions
    expireKeyFor: ${expireKeyFor.toFormat()}
    destroyLock: ${destroyLockEth.toFormat()} ETH / ${destroyLockErc20.toFormat()} ERC20
    disableLock: ${disableLock.toFormat()}
    grantKeys: ${grantKeys.toFormat()}
    renounceOwnership: ${renounceOwnership.toFormat()}
    transferOwnership: ${transferOwnership.toFormat()}
    updateLockName: ${updateLockName.toFormat()}
    updateKeyPrice: ${updateKeyPrice.toFormat()}
    updateRefundPenalty: ${updateRefundPenalty.toFormat()}
    updateTransferFee: ${updateTransferFee.toFormat()}
    withdraw: ${withdrawEth.toFormat()} ETH / ${withdrawErc20.toFormat()} ERC20
  Unlock functions
    createLock: ${createLock.toFormat()}
    setGlobalTokenSymbol: ${setGlobalTokenSymbol.toFormat()}
    setGlobalBaseURI: ${setGlobalBaseTokenURI.toFormat()}`)
  })
})

async function getGasFor(tx) {
  const result = await tx
  const receipt = result.receipt || result
  return new BigNumber(receipt.gasUsed)
}
