const { task } = require('hardhat/config')
const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

task('release', 'Release a new version of the contract')
  .addParam('contract', 'The contract path')
  .addOptionalParam('contractVersion', 'The contract version to use')
  .setAction(async ({ contract, contractVersion }, hre) => {
    let versioned, abiPath, solPath
    const libPath = path.resolve('../packages/contracts/src')
    const contractName = path.basename(contract).replace('.sol', '')

    const isVersioned =
      ['Unlock', 'PublicLock'].includes(contractName) || !!contractVersion

    // flatten the contract
    const flattenPath = `contracts/${contractName}.flatten.sol`

    // NB: this uses a shell child process bcz hardhat flatten output only to stdout
    await exec(`hardhat flatten ${contract} > ${flattenPath}`)
    console.log(
      `Solidity contract for ${contractName} flattened at: ${flattenPath}`
    )

    // get data
    await hre.run('compile', contractName)

    // parse specific paths for Unlock and PublicLock
    if (isVersioned) {
      // deploy to get version number from contract
      const Contract = await hre.ethers.getContractFactory(
        `${flattenPath}:${contractName}`
      )
      const instance = await Contract.deploy()

      // get version number
      const version =
        contractVersion || contractName === 'Unlock'
          ? await instance.unlockVersion()
          : await instance.publicLockVersion()

      // parse names properly
      versioned = `${contractName}V${version}`
      abiPath = path.resolve(libPath, 'abis', contractName, `${versioned}.json`)
      solPath = path.resolve(
        libPath,
        'contracts',
        contractName,
        `${versioned}.sol`
      )
    } else {
      abiPath = path.resolve(
        libPath,
        'abis',
        contract.replace('contracts/', '').replace('.sol', '.json')
      )
      solPath = path.resolve(
        libPath,
        'contracts',
        contract.replace('contracts/', '')
      )
    }

    // copy .sol file
    await fs.copyFile(flattenPath, solPath)
    console.log(`Solidity contracts for ${contractName} copied to: ${solPath}`)

    // write artifacts
    const artifact = await hre.artifacts.readArtifact(
      `${flattenPath}:${contractName}`
    )
    // add version path in artifact if necessary
    if (isVersioned) {
      artifact.contractName = versioned
      artifact.sourceName = `contracts/${contractName}/${versioned}.sol`
    }
    await fs.writeJSON(abiPath, artifact, { spaces: 2 })
    console.log(`Artifact for ${contractName} at: ${abiPath}`)

    if (isVersioned) {
      // copy the interface the contract
      const interfacePath = path.resolve(
        libPath,
        'contracts',
        contractName,
        `I${versioned}.sol`
      )
      await fs.copyFile(
        path.resolve('contracts', 'interfaces', `I${contractName}.sol`),
        interfacePath
      )

      // replace interface name with versioned name in interface
      await exec(
        `sed -i '' 's/interface I${contractName}/interface I${versioned}/g' ${interfacePath}`
      )

      console.log(
        `Solidity interface for ${contractName} copied to: ${interfacePath}`
      )
    }
  })
