const BigNumber = require('bignumber.js')
const { constants } = require('hardlydifficult-eth')

/**
 * @param swapAndCallContract the truffle contract object
 * @param sourceToken the ERC-20 token to collect from the user, if applicable.
 * @param sourceValue the amount of tokens to collect or 0.
 * @param calls [{contract: address, callData: bytes, value: uint256}]
 * @param tokenToRefund an additional ERC-20 token to refund, if applicable.
 * @param options web3 call options (such as from, gas, gasPrice)
 */
module.exports = async function makeCalls(
  swapAndCallContract,
  sourceToken,
  sourceValue,
  calls,
  tokenToRefund,
  options
) {
  const contracts = []
  let callDataConcat = ''
  const startPositions = []
  const values = []
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i]
    contracts.push(call.contract)
    if (i > 0) {
      startPositions.push(callDataConcat.length / 2)
    }
    callDataConcat += call.callData.replace('0x', '')
    values.push(new BigNumber(call.value || 0).toFixed())
  }

  await swapAndCallContract.swapAndCall(
    sourceToken || constants.ZERO_ADDRESS,
    new BigNumber(sourceValue || 0).toFixed(),
    contracts,
    `0x${callDataConcat}`,
    startPositions,
    values,
    tokenToRefund || constants.ZERO_ADDRESS,
    options
  )
}
