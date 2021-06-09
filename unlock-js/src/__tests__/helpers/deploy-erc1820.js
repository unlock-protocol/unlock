/* eslint-disable no-console */
import erc1820 from 'erc1820'
import { ethers } from 'ethers'

/**
 * Losely ported from https://github.com/0xjac/ERC1820/blob/master/js/deployment.js
 * @param {*} providerUrl
 */
export const deploy = async (provider, signer) => {
  const erc1820DeployTransaction = erc1820.generateDeployTx()

  // First : check if the contract has been deployed
  const deployedCode = await provider.getCode(
    erc1820DeployTransaction.contractAddr
  )

  // If the contract has not been deployed, let's do it!
  if (deployedCode.length <= 3) {
    const tx = {
      to: erc1820DeployTransaction.sender,
      value: ethers.utils.parseEther('0.1'),
    }
    // First send a little bit of Eth to the right address
    const transferTransaction = await signer.sendTransaction(tx)
    await transferTransaction.wait()
    // Then deploy from the signed transaction, from the provider (not from the wallet)
    const deployTransaction = await provider.sendTransaction(
      erc1820DeployTransaction.rawTx
    )
    return await deployTransaction.wait()
  }
  return Promise.resolve()
}

export default {
  deploy,
}
