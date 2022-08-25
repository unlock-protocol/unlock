#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const abis = require('@unlock-protocol/contracts')

const abisFolderPath = path.join(__dirname, '..', 'abis')

const unlockVersions = ['v11']
const publicLockVersions = ['v7', 'v11']

function setupFolder() {
  // make sure we clean up
  if (fs.pathExistsSync(abisFolderPath)) {
    fs.rmdirSync(abisFolderPath, { recursive: true, force: true })
  }
  fs.mkdirSync(abisFolderPath)
}

function copyAbi(contractName, version) {
  let events = {}
  const versionName = `${contractName}${version.toUpperCase()}`
  const { abi } = abis[versionName]
  const abiPath = path.join(abisFolderPath, `${versionName}.json`)
  fs.writeJSONSync(abiPath, abi, { spaces: 2 })
}


// process all
setupFolder()
publicLockVersions.map((version) => copyAbi('PublicLock', version))
unlockVersions.map((version) => copyAbi('Unlock', version))
console.log(
  `Abis file saved at: ${abisFolderPath} (PublicLock : ${publicLockVersions.toString()} - Unlock: ${unlockVersions.toString()})`
)
