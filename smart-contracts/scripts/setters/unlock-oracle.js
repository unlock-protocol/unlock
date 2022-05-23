const { ethers } = require('hardhat')

async function main({ unlockAddress, udtAddress, oracleAddress }) {
  if (!unlockAddress) {
    throw new Error(
      'UNLOCK ORACLE CONFIG > Missing Unlock address... aborting.'
    )
  }
  if (!udtAddress) {
    throw new Error('UNLOCK ORACLE CONFIG > Missing UDT address... aborting.')
  }
  if (!oracleAddress) {
    throw new Error(
      'UNLOCK ORACLE CONFIG > Missing oracle address... aborting.'
    )
  }

  const [deployer] = await ethers.getSigners()

  // get unlock instance
  const Unlock = await ethers.getContractFactory('Unlock')
  const unlock = Unlock.attach(unlockAddress)

  // set oracle
  const tx = await unlock.connect(deployer).setOracle(udtAddress, oracleAddress)
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
