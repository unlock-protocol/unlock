const shouldFail = require('../helpers/shouldFail')
const unlockContract = artifacts.require('../Unlock.sol')
const getUnlockProxy = require('../helpers/proxy')
const Web3Abi = require('web3-eth-abi')
const abi = new Web3Abi.AbiCoder()

let unlock

contract('Unlock / noFallback', accounts => {
  before(async () => {
    unlock = await getUnlockProxy(unlockContract)
  })

  it('cannot call the fallback function directly', async () => {
    await shouldFail(unlock.sendTransaction(), 'NO_FALLBACK')
  })

  it('does not accept ETH directly', async () => {
    await shouldFail(unlock.send(1))
  })

  it('can call a function by name', async () => {
    await web3.eth.call({
      to: unlock.address,
      data: abi.encodeFunctionSignature('totalDiscountGranted()'),
    })
  })

  it('cannot call a function which does not exist', async () => {
    await shouldFail(
      web3.eth.call({
        to: unlock.address,
        data: abi.encodeFunctionSignature('dne()'),
      }),
      'NO_FALLBACK'
    )
  })
})
