const { task } = require('hardhat/config')
const fs = require('fs-extra')
const path = require('path')
const { exec } = require('child_process')

task('release', 'Release a new version of the contract')
  .addParam('contract', 'The contract path')
  .setAction(async ({ contract }, hre) => {
    const contractName = contract.replace('contracts/', '').replace('.sol', '')

    if (!['Unlock', 'PublicLock'].includes(contractName))
      throw new Error('Only Unlock and PublickLock supported')

    // get data
    await hre.run('compile', contractName)

    // get version number
    const Contract = await hre.ethers.getContractFactory(contractName)
    const instance = await Contract.deploy()
    await instance.deployed()
    const version =
      contractName === 'Unlock'
        ? await instance.unlockVersion()
        : await instance.publicLockVersion()

    // console.log(version)
    const versioned = `${contractName}V${version}`
    const libPath = path.resolve('../packages/contracts/src')

    // write artifacts
    const abiPath = path.resolve(
      libPath,
      'abis',
      contractName,
      `${versioned}.json`
    )
    const artifact = await hre.artifacts.readArtifact(contractName)
    await fs.writeJSON(abiPath, artifact, { spaces: 2 })
    console.log(`Artifact for ${contractName} at: ${abiPath}`)

    // flatten the contract
    const solPath = path.resolve(
      libPath,
      'contracts',
      contractName,
      `${versioned}.sol`
    )
    // NB: this uses a shell child process bcz hardhat flatten output only to stdout
    exec(`hardhat flatten ${contract} > ${solPath}`)
    console.log(
      `Solidity contract for ${contractName} flattened at: ${solPath}`
    )

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
    console.log(
      `Solidity interface for ${contractName} copied to: ${interfacePath}`
    )
  })
