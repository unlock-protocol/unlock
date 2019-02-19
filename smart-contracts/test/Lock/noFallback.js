const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')
const abi = new require('web3-eth-abi').AbiCoder()

let lock

contract('Unlock', accounts => {
  before(async () => {
    const unlock = await Unlock.deployed()
    const locks = await deployLocks(unlock)
    lock = locks['FIRST']
  })

  describe('noFallback', () => {
    it('cannot call the fallback function directly', async () => {
      await shouldFail(lock.sendTransaction(), 'NO_FALLBACK')
    })

    it('does not accept ETH directly', async () => {
      await shouldFail(lock.send(1))
    })

    it('can call a function by name', async () => {
      await lock.sendTransaction({data: abi.encodeFunctionSignature('numberOfOwners()')})
    })

    it('cannot call a function which does not exist', async () => {
      await shouldFail(lock.sendTransaction({data: abi.encodeFunctionSignature('dne()')}), 'NO_FALLBACK')
    })
  })
})
