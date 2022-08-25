#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const abis = require('@unlock-protocol/contracts')
const ethers = require('ethers')

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
  const versionName = `${contractName}${version.toUpperCase()}`
  const { abi } = abis[versionName]
  const abiPath = path.join(abisFolderPath, `${versionName}.json`)
  fs.writeJSONSync(abiPath, abi, { spaces: 2 })
}

// parse event signatures
function parseEventsSig(contractName, version) {
  const versionName = `${contractName}${version.toUpperCase()}`
  const { abi } = abis[versionName]

  const iface = new ethers.utils.Interface(
    abi.filter(({ type }) => type === 'event')
  )
  return iface.format(ethers.utils.FormatTypes.minimal).map((d) => [version, d])
}

function parseAndCopyAbis() {
  // process all
  setupFolder()
  publicLockVersions.map((version) => copyAbi('PublicLock', version))
  unlockVersions.map((version) => copyAbi('Unlock', version))
  console.log(
    `Abis file saved at: ${abisFolderPath} (PublicLock : ${publicLockVersions.toString()} - Unlock: ${unlockVersions.toString()})`
  )
}

// show all existing events version by version
function showAllEvents() {
  const events = publicLockVersions
    .map((version) => parseEventsSig('PublicLock', version))
    .flat()
    .filter(
      ([_, sig], pos, self) => self.map(([v, s]) => s).indexOf(sig) == pos
    )
    .map(([version, sig]) => `${version}-${sig.slice(6, sig.length)}`)

  console.log(events)
}

module.exports = {
  showAllEvents,
  parseAndCopyAbis,
}
