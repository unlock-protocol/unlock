const { run, ethers } = require('hardhat')
const path = require('path')
const fs = require('fs')

async function main({ contract }) {
  if (!fs.existsSync(contract)) {
    throw Error(`Missing contract at ${contract}`)
  }

  const contractName = path.basename(contract).replace('.sol', '')
  await run('compile')

  const Factory = await ethers.getContractFactory(contractName)
  const instance = await Factory.deploy()
  await instance.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `Deploy > ${contractName} deployed to : ${instance.address} (tx: ${instance.deployTransaction.hash}`
  )
  return instance.address
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
