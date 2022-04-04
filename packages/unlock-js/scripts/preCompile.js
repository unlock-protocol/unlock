const fs = require('fs-extra')
const path = require('path')
const { run } = require('hardhat')

async function main({ unlockName }) {
  const unlockSourcePath = require.resolve(
    `@unlock-protocol/contracts/dist/Unlock/${unlockName}.sol`
  )

  // dests
  const contractPath = path.resolve(
    `./src/__tests__/contracts/${unlockName}.sol`
  )
  const artifactPath = path.resolve(
    `./src/__tests__/artifacts/${unlockName}.sol`
  )

  // remove existing contracts if any
  await fs.remove(contractPath)
  await fs.remove(artifactPath)

  // copy contract source  over
  await fs.copy(unlockSourcePath, path.resolve(contractPath))

  // compile contract using hardhat
  await run('compile')
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
