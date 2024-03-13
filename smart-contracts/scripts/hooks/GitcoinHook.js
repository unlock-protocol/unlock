const { ethers } = require('hardhat')

async function main() {
  const [user] = await ethers.getSigners()

  console.log('Deploying from :', user.address)

  // obtain the contract to deploy
  const GitcoinHook = await ethers.getContractFactory('GitcoinHook')
  const hook = await GitcoinHook.deploy()

  await hook.deployed()

  console.log(
    'Gitcoin hook deployed to:',
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
