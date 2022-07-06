const { ethers } = require('hardhat')
const WETH = require('../../test/helpers/ABIs/weth.json')

async function main() {
  const Weth = await ethers.getContractFactory(WETH.abi, WETH.bytecode)
  const weth = await Weth.deploy()
  await weth.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `WETH > deployed to : ${weth.address} (tx: ${weth.deployTransaction.hash}`
  )
  return weth.address
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
