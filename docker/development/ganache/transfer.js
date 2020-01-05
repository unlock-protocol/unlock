const ethers = require('ethers')

/**
 * This function transfers amount Eth to the recipient.
 * @param {*} provider
 * @param {*} recipients
 */
async function transfer(provider, signer, recipient, amount) {
  let wallet = await provider.getSigner(signer)

  return await wallet.sendTransaction({
    to: recipient,
    value: ethers.utils.parseEther(amount),
  })
}

module.exports = {
  transfer,
}
