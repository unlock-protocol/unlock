const { ethers } = require('hardhat')

async function increaseBlock(block = 1) {
  for (let i = 0; i < block; i++) {
    await ethers.provider.send('evm_mine')
  }
}

module.exports = {
  increaseBlock,
}
