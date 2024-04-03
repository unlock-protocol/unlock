const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')

const fetchDataFromTx = async ({
  txHash,
  abi,
  eventName = 'TransactionAdded',
}) => {
  const { interface } = await ethers.getContractAt(abi, ADDRESS_ZERO)

  // fetch data from tx
  const { logs } = await ethers.provider.getTransactionReceipt(txHash)
  const parsedLogs = logs.map((log) => {
    try {
      return interface.parseLog(log)
    } catch (error) {
      return {}
    }
  })
  const { args } = parsedLogs.find(({ name }) => name === eventName)
  return args
}

module.exports = {
  fetchDataFromTx,
}
