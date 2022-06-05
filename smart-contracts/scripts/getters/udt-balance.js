const { ethers } = require('hardhat')
const { getDeployment } = require('../../helpers/deployments')

async function main({ account }) {
  if (!account) {
    throw new Error('UDT BALANCE > Missing account.')
  }

  const { chainId } = await ethers.provider.getNetwork()

  // contract instance etc
  const { address, abi } = getDeployment(chainId, 'UnlockDiscountTokenV3')
  const udt = await ethers.getContractAt(abi, address)

  // eslint-disable-next-line no-console
  console.log(
    'UDT balance:',
    ethers.utils.formatUnits(await udt.balanceOf(account), 18)
  )
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
