const walletService = require('./walletServiceMock')

/**
 * A thin wrapper for smart contract tests to interact with a Lock.
 *
 * At the moment, this is only for APIs with a unique call requirement:
 *  - https://github.com/trufflesuite/truffle/issues/1729
 */
module.exports = function lockApi(lockContract) {
  return {
    async purchaseFor(keyOwner, from = keyOwner, ethValue = 0) {
      const call = web3.eth.abi.encodeFunctionCall(
        lockContract.abi.find(e => e.name === 'purchaseFor'),
        [keyOwner]
      )
      return web3.eth.sendTransaction({
        to: lockContract.address,
        value: ethValue,
        data: call,
        from,
        gas: walletService.gasAmountConstants().purchaseKey,
      })
    },

    async purchaseForFrom(keyOwner, referrer, from = keyOwner, ethValue = 0) {
      const call = web3.eth.abi.encodeFunctionCall(
        lockContract.abi.find(e => e.name === 'purchaseForFrom'),
        [keyOwner, referrer]
      )
      return web3.eth.sendTransaction({
        to: lockContract.address,
        value: ethValue,
        data: call,
        from,
        gas: walletService.gasAmountConstants().purchaseKey,
      })
    },

    async cancelAndRefund(from) {
      const call = web3.eth.abi.encodeFunctionCall(
        lockContract.abi.find(e => e.name === 'cancelAndRefund'),
        []
      )
      return web3.eth.sendTransaction({
        to: lockContract.address,
        data: call,
        from,
        gas: walletService.gasAmountConstants().cancelAndRefund,
      })
    },

    async partialWithdraw(amount, from) {
      const call = web3.eth.abi.encodeFunctionCall(
        lockContract.abi.find(e => e.name === 'partialWithdraw'),
        [amount]
      )
      return web3.eth.sendTransaction({
        to: lockContract.address,
        data: call,
        from,
        gas: walletService.gasAmountConstants().withdrawFromLock,
      })
    },

    async transferFrom(from, recipient, tokenId, transferFee, sender = from) {
      const call = web3.eth.abi.encodeFunctionCall(
        lockContract.abi.find(e => e.name === 'transferFrom'),
        [from, recipient, tokenId]
      )
      return web3.eth.sendTransaction({
        to: lockContract.address,
        data: call,
        from: sender,
        value: transferFee,
        gas: walletService.gasAmountConstants().withdrawFromLock,
      })
    },

    async safeTransferFrom(
      from,
      recipient,
      tokenId,
      transferFee,
      sender = from
    ) {
      const call = web3.eth.abi.encodeFunctionCall(
        lockContract.abi.find(e => e.name === 'safeTransferFrom'),
        [from, recipient, tokenId]
      )
      return web3.eth.sendTransaction({
        to: lockContract.address,
        data: call,
        from: sender,
        value: transferFee,
        gas: walletService.gasAmountConstants().withdrawFromLock,
      })
    },

    async withdraw(from) {
      const call = web3.eth.abi.encodeFunctionCall(
        lockContract.abi.find(e => e.name === 'withdraw'),
        []
      )
      return web3.eth.sendTransaction({
        to: lockContract.address,
        data: call,
        from,
        gas: walletService.gasAmountConstants().withdrawFromLock,
      })
    },
  }
}
