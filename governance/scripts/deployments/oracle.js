const { ethers } = require('hardhat')
const UniswapOracleV2 = require('@unlock-protocol/hardhat-helpers/dist/ABIs/UniswapV2Oracle.json')
const { UniswapOracleV3 } = require('@unlock-protocol/contracts')

const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

// TODO: check if oracle has already been deployed and skips if one already exists!
async function main({ uniswapFactoryAddress, uniswapVersion = 3 } = {}) {
  if (!uniswapFactoryAddress) {
    console.log(await getNetwork())
    const {
      uniswapV3: { factoryAddress },
    } = await getNetwork()
    uniswapFactoryAddress = factoryAddress
  }

  if (!uniswapFactoryAddress) {
    // eslint-disable-next-line no-console
    throw new Error(
      'UNISWAP ORACLE > Missing Uniswap Factory address... aborting.'
    )
  }

  let Oracle
  if (uniswapVersion == 2) {
    Oracle = await ethers.getContractFactory(
      UniswapOracleV2.abi,
      UniswapOracleV2.bytecode
    )
  } else if (uniswapVersion == 3) {
    Oracle = await ethers.getContractFactory(
      UniswapOracleV3.abi,
      UniswapOracleV3.bytecode
    )
  }

  const oracle = await Oracle.deploy(uniswapFactoryAddress)
  await oracle.waitForDeployment()
  const { hash } = await oracle.deploymentTransaction()

  // get addresses
  const oracleAddress = await oracle.getAddress()

  console.log(
    `UNISWAP ORACLE > Oracle deployed at ${oracleAddress} (tx: ${hash})`
  )

  return oracleAddress
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
