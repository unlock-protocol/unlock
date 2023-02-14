const { ethers } = require('hardhat')
const UniswapOracleV2 = require('../../test/helpers/ABIs/UniswapV2Oracle.json')

const {
  UNISWAP_FACTORY_ADDRESS: UNISWAPV3_FACTORY_ADDRESS,
} = require('../../test/helpers')

// TODO: check if oracle has already been deployed and skips if one already exists!
async function main({
  uniswapFactoryAddress = UNISWAPV3_FACTORY_ADDRESS,
  uniswapVersion = 3,
} = {}) {
  if (uniswapVersion == 2 && !uniswapFactoryAddress) {
    // eslint-disable-next-line no-console
    throw new Error(
      'UNISWAP ORACLE > Missing Uniswap V2 Factory address... aborting.'
    )
  }
  let Oracle
  if (uniswapVersion == 2) {
    Oracle = await ethers.getContractFactory(
      UniswapOracleV2.abi,
      UniswapOracleV2.bytecode
    )
  } else if (uniswapVersion == 3) {
    Oracle = await ethers.getContractFactory('UniswapOracleV3')
  }

  const oracle = await Oracle.deploy(uniswapFactoryAddress)
  await oracle.deployed()

  // eslint-disable-next-line no-console
  console.log(
    'UNISWAP ORACLE > Oracle deployed at:',
    oracle.address,
    ` (tx: ${oracle.deployTransaction.hash})`
  )

  return oracle.address
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
