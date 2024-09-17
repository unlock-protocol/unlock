const { ethers } = require('hardhat')
const { deployLock, reverts } = require('../helpers')

describe('Lock / fail to deploy', async () => {
  it('fail to deploy Lock if invalid ERC20 input', async () => {
    const NonToken = await ethers.getContractFactory('ERC20')
    const nonToken = await NonToken.deploy('Non Token', 'Token')
    await reverts(
      deployLock({
        tokenAddress: await nonToken.getAddress(),
      }),
      'INVALID_TOKEN'
    )
  })
})
