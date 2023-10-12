const { ethers } = require('hardhat')

async function main() {
  const [user] = await ethers.getSigners()

  console.log('Deploying from :', user.address)

  // We get the contract to deploy
  // 0x58b5cede554a39666091f96c8058920df5906581 is the Locksmith purchaser on Unlock's side.
  const secretSigner = '0x58b5cede554a39666091f96c8058920df5906581'

  const CaptchaHook = await ethers.getContractFactory('CaptchaHook')
  const hook = await CaptchaHook.deploy(secretSigner)

  await hook.deployed()

  console.log('Hook deployed to:', hook.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
