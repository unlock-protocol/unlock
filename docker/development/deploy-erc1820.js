/* eslint-disable no-console */
const erc1820 = require('erc1820')
const ethers = require('ethers')

/**
 * Losely ported from https://github.com/0xjac/ERC1820/blob/master/js/deployment.js
 * @param {*} providerUrl
 */
const deploy = async provider => {
  const wallet = provider.getSigner(0)
  const erc1820DeployTransaction = erc1820.generateDeployTx()

  // First : check if the contract has been deployed
  const deployedCode = await provider.getCode(
    erc1820DeployTransaction.contractAddr
  )

  console.log(deployedCode)

  // If the contract has not been deployed, let's do it!
  if (deployedCode.length <= 3) {
    console.log('SEND ETH TO USER WHICH DEPLOYS ERC1820')
    // First send a little bit of Eth to the right address
    const transferTransaction = await wallet.sendTransaction({
      to: erc1820DeployTransaction.sender,
      value: ethers.utils.parseEther('0.1'),
    })
    await transferTransaction.wait()
    console.log('SENT ETH TO USER WHICH DEPLOYS ERC1820')

    // Then deploy from the signed transaction, from the provider (not from the wallet)
    console.log('DEPLOYING ERC1820')
    const deployTransaction = await provider.sendTransaction(
      erc1820DeployTransaction.rawTx
    )
    console.log('DEPLOYED ERC1820')

    return await deployTransaction.wait()
  }
  return Promise.resolve()
}

module.exports = {
  deploy,
}
