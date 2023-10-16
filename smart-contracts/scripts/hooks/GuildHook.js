const networks = require('@unlock-protocol/networks')
const { ethers } = require('hardhat')

async function main() {
  const { chainId } = await ethers.getDefaultProvider().getNetwork()
  const unlockNetworkName = Object.keys(networks).filter((name) => {
    return networks[name].id === chainId
  })[0]

  if (!unlockNetworkName) {
    return console.error('No Unlock network found for chainId', chainId)
  }
  const unlockNetwork = networks[unlockNetworkName]
  const [user] = await ethers.getSigners()

  if (!user) {
    return console.error('No user. Please set the PKEY env var')
  }

  console.log('Deploying from', user.address)

  // We get the contract to deploy
  const signers = [
    '0x22c095c69c38b66afAad4eFd4280D94Ec9D12f4C',
    '0x903073735Bb6FDB802bd3CDD3b3a2b00C36Bc2A9',
  ]

  const PurchaseHook = await ethers.getContractFactory('GuildHook')
  const hook = await PurchaseHook.deploy()

  await hook.deployed()

  console.log('Hook deployed to:', hook.address)
  for (let i = 0; i < signers.length; i++) {
    console.log('Adding signer:', signers[i])
    await hook.addSigner(signers[i])
  }
  if (unlockNetwork.multisig) {
    await hook.transferOwnership(unlockNetwork.multisig)
  }
  console.log(
    'Transfering ownership to multisig signer:',
    unlockNetwork.multisig
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
