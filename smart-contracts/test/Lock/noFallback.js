const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')
const Web3Abi = require('web3-eth-abi')
const abi = new Web3Abi.AbiCoder()

let lock

contract('Unlock', accounts => {
  before(async () => {
    const unlock = await Unlock.deployed()
    const locks = await deployLocks(unlock, accounts[0])
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
      await web3.eth.call({
        to: lock.address,
        data: abi.encodeFunctionSignature('numberOfOwners()')
      })
    })

    it('cannot call a function which does not exist', async () => {
      await shouldFail(web3.eth.call({
        to: lock.address,
        data: abi.encodeFunctionSignature('dne()')
      }), 'NO_FALLBACK')
    })
  })
})
