const { ethers } = require('hardhat')
const { deployLock, reverts } = require('../helpers')

describe('Lock / fail to deploy', async () => {
  it('fail to deploy Lock if invalid ERC20 input', async () => {
    const NonToken = await ethers.getContractFactory('TestERC20')
    const nonToken = await NonToken.deploy()
    await reverts(
      deployLock({
        tokenAddress: await nonToken.getAddress(),
      }),
      'INVALID_TOKEN'
    )
  })
})
