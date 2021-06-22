// const { ethers } = require('hardhat')
const { exportVersionedArtifacts } = require('../helpers/versions')

async function main() {
  // copy all versions from npm over
  exportVersionedArtifacts()

  // just show all artifacts paths
  // const artifacts = await hre.artifacts.getArtifactPaths()
  // console.log(artifacts)

  // make sure artifacts is loading
  // const UnlockV0 = await ethers.getContractFactory('UnlockV0')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
