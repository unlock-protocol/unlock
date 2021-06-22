const fs = require('fs-extra')
const path = require('path')

const abisPath = path.resolve(__dirname, '..', 'published-npm-modules')
const artifactsPath = path.resolve(__dirname, '..', 'artifacts', 'contracts')

const copyABI = function (name, dir) {
  // this will create ex. ../artifacts/contracts/PublicLockV6.sol/PublicLockV6.json
  const version = `${name}${dir}`
  const src = path.resolve(abisPath, dir, `${name}.json`)

  const artifact = fs.readJsonSync(src)

  // hardhat fixes
  const updatedArtifact = Object.assign(
    { ...artifact },
    {
      contractName: version,
      linkReferences: {},
      deployedLinkReferences: {},
    }
  )

  // write
  const dst = path.resolve(
    artifactsPath,
    'versions',
    `${name}${dir}.sol`,
    `${name}${dir}.json`
  )
  fs.writeJsonSync(dst, updatedArtifact, { spaces: 2 })
}

const exportVersionedArtifacts = function () {
  // make sure dir with all versions exist
  fs.ensureDirSync(abisPath)
  const dirs = fs.readdirSync(abisPath)

  // copy artifacts over
  dirs.forEach((dir) => {
    copyABI('Unlock', dir)
    copyABI('PublicLock', dir)
  })
}

module.exports = {
  exportVersionedArtifacts,
}
