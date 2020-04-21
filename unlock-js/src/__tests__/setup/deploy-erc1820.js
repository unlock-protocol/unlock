/* eslint-disable no-console */
const erc1820 = require('erc1820')
const ethers = require('ethers')

/**
 * Losely ported from https://github.com/0xjac/ERC1820/blob/master/js/deployment.js
 * @param {*} providerUrl
 */
const deploy = async (provider, signer) => {
  const erc1820DeployTransaction = erc1820.generateDeployTx()

  // First : check if the contract has been deployed
  const deployedCode = await provider.getCode(
    erc1820DeployTransaction.contractAddr
  )

  // If the contract has not been deployed, let's do it!
  if (deployedCode.length <= 3) {
    // First send a little bit of Eth to the right address
    const transferTransaction = await signer.sendTransaction({
      to: erc1820DeployTransaction.sender,
      value: ethers.utils.parseEther('0.1'),
    })
    await transferTransaction.wait()

    // Then deploy from the signed transaction, from the provider (not from the wallet)
    const deployTransaction = await provider.sendTransaction(
      erc1820DeployTransaction.rawTx
    )

    return await deployTransaction.wait()
  }
  return Promise.resolve()
}

module.exports = {
  deploy,
}
