import { ethers } from 'ethers'
import erc1820 from 'erc1820'

/**
 * Losely ported from https://github.com/0xjac/ERC1820/blob/master/js/deployment.js
 * @param {*} providerUrl
 */
const deploy = async providerUrl => {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl)
  const wallet = provider.getSigner(0)
  const erc1820DeployTransaction = erc1820.generateDeployTx()

  // First : check if the contract has been deployed
  const deployedCode = await provider.getCode(
    erc1820DeployTransaction.contractAddr
  )

  // If the contract has not been deployed, let's do it!
  if (deployedCode.length <= 3) {
    // First send a little bit of Eth to the right address
    const transferTransaction = await wallet.sendTransaction({
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

export default deploy
