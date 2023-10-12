const { ethers } = require('hardhat')

async function main() {
  const [user] = await ethers.getSigners()
  if (!user) {
    throw new Error('Missing signer!')
  }
  const { chainId } = await user.provider.getNetwork()
  console.log(`Deploying from ${user.address} on ${chainId}`)

  const PurchaseHook = await ethers.getContractFactory('PasswordRequiredHook')
  const hook = await PurchaseHook.deploy()
  await hook.deployed()

  console.log('Hook deployed to:', hook.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
