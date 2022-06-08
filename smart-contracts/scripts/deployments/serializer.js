const { ethers } = require('hardhat')
const { addDeployment } = require('../../helpers/deployments')

async function main() {
  const LockSerializer = await ethers.getContractFactory('LockSerializer')
  const serializer = await LockSerializer.deploy()
  await serializer.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `SERIALIZER > deployed to : ${serializer.address} (tx: ${serializer.deployTransaction.hash})`
  )

  // save deployment info
  await addDeployment('LockSerializer', serializer, false)

  return serializer.address
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
