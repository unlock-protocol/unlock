#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const abis = require('@unlock-protocol/contracts')
const ethers = require('ethers')

const abisFolderPath = path.join(__dirname, '..', 'abis')

const getVersions = (contractName) =>
  Object.keys(abis)
    .filter((n) => n.includes(`${contractName}V`))
    .map((n) => parseInt(n.slice(contractName.length + 1, n.length)))
    .sort((a, b) => a - b)
    .filter((n) => n >= 7)
    .map((n) => `v${n}`)

const unlockVersions = ['v11']
const publicLockVersions = getVersions('PublicLock')

function setupFolder() {
  // make sure we clean up
  if (fs.pathExistsSync(abisFolderPath)) {
    fs.rmSync(abisFolderPath, { recursive: true, force: true })
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

  // merge
  mergeAbi('PublicLock')
}

// show all existing events version by version
function showAllContractEvents(contractName) {
  return (contractName === 'Unlock' ? unlockVersions : publicLockVersions)
    .map((version) => parseEventsSig(contractName, version))
    .flat()
    .filter(
      ([_, sig], pos, self) => self.map(([v, s]) => s).indexOf(sig) == pos
    )
    .map(([version, sig]) => `${version}-${sig.slice(6, sig.length)}`)
}

function showAllEvents() {
  console.log(
    'Unlock: ',
    showAllContractEvents('Unlock'),
    '\nPublicLock: ',
    showAllContractEvents('PublicLock')
  )
}

function mergeAbi(contractName) {
  const merged = (
    contractName === 'Unlock' ? unlockVersions : publicLockVersions
  )
    .map((version) => abis[`${contractName}${version.toUpperCase()}`])
    .map(({ abi }) => abi)
    .flat()

  // dedupe
  const deduped = merged
    .map((item) => ({
      ...item,
      sig: new ethers.utils.Interface([item]).format(
        ethers.utils.FormatTypes.minimal
      )[0],
    }))
    .filter((v, i, a) => a.findIndex((v2) => v2.sig === v.sig) === i)

  const abiPath = path.join(abisFolderPath, `${contractName}.json`)
  fs.writeJSONSync(abiPath, deduped, { spaces: 2 })
}

module.exports = {
  showAllEvents,
  parseAndCopyAbis,
}
