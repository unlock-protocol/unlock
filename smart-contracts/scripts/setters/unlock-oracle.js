const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

async function main({ unlockAddress, tokenAddress, oracleAddress }) {
  const { chainId } = await ethers.provider.getNetwork()
  if (!oracleAddress) {
    oracleAddress = networks[chainId].uniswapV3.oracle
  }
  if (!unlockAddress) {
    unlockAddress = networks[chainId].unlockAddress
  }
  
  if (!unlockAddress) {
    throw new Error(
      'UNLOCK ORACLE CONFIG > Missing Unlock address... aborting.'
    )
  }
  if (!oracleAddress) {
    throw new Error(
      'UNLOCK ORACLE CONFIG > Missing oracle address... aborting.'
    )
  }

  if (!tokenAddress) {
    throw new Error('UNLOCK ORACLE CONFIG > Missing UDT address... aborting.')
  }

  console.log(
    `UNLOCK ORACLE CONFIG > Configuring oracle on chain ${chainId} at ${oracleAddress} for ${tokenAddress}`
  )

  const [deployer] = await ethers.getSigners()

  // get unlock instance
  const Unlock = await ethers.getContractFactory('Unlock')
  const unlock = Unlock.attach(unlockAddress)

  // set oracle
  const tx = await unlock.connect(deployer).setOracle(tokenAddress, oracleAddress)
  const { transactionHash } = await tx.wait()

  console.log(
    `UNLOCK ORACLE CONFIG > Oracle configured properly. (tx: ${transactionHash})`
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
