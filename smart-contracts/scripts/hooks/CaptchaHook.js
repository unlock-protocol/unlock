const { ethers } = require('hardhat')

async function main() {
  const [user] = await ethers.getSigners()

  console.log('Deploying from :', user.address)

  // We get the contract to deploy
  const CaptchaHook = await ethers.getContractFactory('CaptchaHook')
  const hook = await CaptchaHook.deploy()

  await hook.deployed()

  console.log(
    'Hook deployed to:',
    hook.address,
    '. You can add signers now and transfer ownership of this hook to the multisig!'
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
