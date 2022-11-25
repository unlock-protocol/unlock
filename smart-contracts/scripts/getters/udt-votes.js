const { ethers } = require('hardhat')

async function main({ account, udtAddress }) {
  if (!account) {
    throw new Error('UDT BALANCE > Missing account.')
  }

  // contract instance etc
  const udt = await ethers.getContractAt('UnlockDiscountTokenV3', udtAddress)

  // eslint-disable-next-line no-console
  console.log(
    `Voting power: ${udtAddress}`,
    ethers.utils.formatUnits(await udt.getVotes(account), 18)
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
