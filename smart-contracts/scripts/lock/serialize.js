const { ethers } = require('hardhat')

async function main({ lockAddress, serializerAddress }) {
  const Serializer = await ethers.getContractFactory('LockSerializer')
  const serializer = Serializer.attach(serializerAddress)
  const serialized = await serializer.serialize(lockAddress)
  return serialized
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
