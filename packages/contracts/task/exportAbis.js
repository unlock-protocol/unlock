const { task } = require('hardhat/config')
const fs = require('fs-extra')
const path = require('path')
const { exec } = require('child_process')

task('export', 'Export the abi of a contract')
  .addParam('contract', 'The contract path')
  .setAction(async ({ contract }, { run, artifacts }) => {
    const contractName = contract.replace('src/contracts/', '').split('/')[0]
    const versioned = contract.replace('src/contracts/', '').split('/')[1].replace('.sol', '')
    console.log(contract, contractName, versioned)

    // get data
    await run('compile', contractName)

    const libPath = path.resolve('./src')
    const abiPath = path.resolve(
      libPath,
      'abis',
      contractName,
      `${versioned}.json`
    )

    // make sure we dont erase anything
    if (await fs.pathExists(abiPath)) {
      // eslint-disable-next-line no-console
      console.log(`File ${abiPath} already exists.`)
    } else {
      // write files
      const artifact = await artifacts.readArtifact(`${contract}:${contractName}`)
      await fs.writeJSON(abiPath, artifact, { spaces: 2 })
      // eslint-disable-next-line no-console
      console.log(`Artifact for ${contractName} at: ${abiPath}`)
    }

  })
