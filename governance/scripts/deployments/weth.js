const { ethers } = require('hardhat')
const { deployContract } = require('@unlock-protocol/hardhat-helpers')
const WETH = require('@unlock-protocol/hardhat-helpers/dist/ABIs/weth.json')

async function main() {
  const Weth = await ethers.getContractFactory(WETH.abi, WETH.bytecode)
  const { contract: weth, address, hash } = await deployContract(Weth)

  console.log(`WETH > deployed to : ${address} (tx: ${hash}`)
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
