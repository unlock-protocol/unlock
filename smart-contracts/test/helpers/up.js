const { ethers } = require('hardhat')
const { parseLogs } = require('./interface')

async function getUp({
  udt,
  swap,
  spender,
  recipient,
  amount = ethers.parseUnits('1000', 'ether'),
}) {
  if (!spender) {
    spender = recipient
  }

  const [, minter] = await ethers.getSigners()

  // prepare funds and allowance
  await udt.connect(minter).mint(await spender.getAddress(), amount)
  await udt.connect(spender).approve(await swap.getAddress(), amount)

  // do the swap
  const tx = await swap
    .connect(spender)
    .swapUDTForUP(amount, await recipient.getAddress())

  // parse receipt
  const receipt = await tx.wait()
  const parsedLogs = parseLogs(receipt.logs, udt.interface)
  return parsedLogs
}

module.exports = {
  getUp,
}
