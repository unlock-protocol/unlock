const { ethers } = require('hardhat')

/**
 * This function transfers amount Eth to the recipient.
 * @param {*} provider
 * @param {*} recipients
 */
async function transfer(provider, signer, recipient, amount) {
  let wallet = await provider.getSigner(signer)

  const transaction = await wallet.sendTransaction({
    to: recipient,
    value: ethers.utils.parseEther(amount),
  })
  return await transaction.wait()
}

module.exports = {
  transfer,
}
