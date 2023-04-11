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

  // get unlock instance
  const unlock = await ethers.getContractAt('Unlock', unlockAddress)
  
  const [owner] = await ethers.getSigners()

  console.log(
    `UNLOCK ORACLE CONFIG > Configuring oracle on chain ${chainId} 
    - unlock: ${unlockAddress}
    - oracle: ${oracleAddress} 
    - token: ${tokenAddress}
    - signer: ${owner.address}
    `
  )
  
  // set oracle
  const tx = await unlock.connect(owner).setOracle(tokenAddress, oracleAddress)
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
