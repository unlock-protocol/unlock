const { networks } = require('@unlock-protocol/networks')
const { ethers } = require('hardhat')

async function main() {
  const [user] = await ethers.getSigners()
  const { chainId } = await user.provider.getNetwork()

  const unlockNetwork = networks[chainId]

  if (!user) {
    return console.error('No user. Please set the PKEY env var')
  }

  console.log('Deploying from', user.address)

  const signers = [
    '0x22c095c69c38b66afAad4eFd4280D94Ec9D12f4C', // prod purchaser
    '0x903073735Bb6FDB802bd3CDD3b3a2b00C36Bc2A9', // staging purchaser
    '0xd851fe9ba8EfA66e65d7865690bD2B9522C6E99f', // OpenZeppelin purchaser
  ]

  const PurchaseHook = await ethers.getContractFactory('GuildHook')
  const hook = await PurchaseHook.deploy()

  await hook.deployed()

  console.log('Guild Hook deployed to:', hook.address)
  for (let i = 0; i < signers.length; i++) {
    console.log('Adding signer:', signers[i])
    await hook.addSigner(signers[i])
  }
  if (unlockNetwork.multisig) {
    console.log(
      'Transfering ownership to multisig signer:',
      unlockNetwork.multisig
    )
    await hook.transferOwnership(unlockNetwork.multisig)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
