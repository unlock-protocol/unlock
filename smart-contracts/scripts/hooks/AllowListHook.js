const { ethers } = require('hardhat')

async function main() {
  const [user] = await ethers.getSigners()

  console.log('Deploying from :', user.address)

  // We get the contract to deploy
  const AllowListHook = await ethers.getContractFactory('AllowListHook')
  const hook = await AllowListHook.deploy()

  await hook.deployed()

  console.log('Hook deployed to:', hook.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
