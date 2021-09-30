const ethers = require('ethers')

/**
 * This function transfers amount Eth to the recipient.
 * @param {*} provider
 * @param {*} recipients
 */
async function transfer(provider, signer, recipient, amount) {
  const transaction = await signer.sendTransaction({
    to: recipient,
    value: ethers.utils.parseEther(amount),
  })
  return await transaction.wait()
}

module.exports = {
  transfer,
}
