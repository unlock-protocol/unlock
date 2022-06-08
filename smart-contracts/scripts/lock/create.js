const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

const createLockHash = require('../../test/helpers/createLockCalldata')

const defaultParams = {
  expirationDuration: ethers.BigNumber.from(60 * 60 * 24 * 30), // 30 days
  keyPrice: ethers.utils.parseEther('0.01'), // in wei
  maxNumberOfKeys: 100,
  lockName: 'Unlock-Protocol Lock',
}

async function main({
  price,
  duration,
  name,
  beneficiary,
  tokenAddress,
  maxNumberOfKeys,
  lockVersion,
}) {
  // set params
  const lockParams = [
    duration || defaultParams.expirationDuration,
    tokenAddress || ethers.constants.AddressZero,
    price || defaultParams.keyPrice,
    maxNumberOfKeys || defaultParams.maxNumberOfKeys,
    name || defaultParams.lockName,
  ]

  // get unlock on current network
  const { chainId } = await ethers.provider.getNetwork()
  const { unlockAddress } = networks[chainId]

  const Unlock = await ethers.getContractFactory('Unlock')
  const unlock = Unlock.attach(unlockAddress)

  // send tx
  const [signer] = await ethers.getSigners()
  lockVersion = lockVersion || 10
  beneficiary = beneficiary || signer.address

  const calldata = await createLockHash({
    args: lockParams,
    from: beneficiary,
  })

  const tx = await unlock.createUpgradeableLockAtVersion(calldata, lockVersion)
  const { events, transactionHash } = await tx.wait()
  const { args } = events.find(({ event }) => event === 'NewLock')
  const { newLockAddress } = args

  // eslint-disable-next-line no-console
  console.log(
    `LOCK DEPLOY > deployed to : ${newLockAddress} (tx: ${transactionHash}) \n with params: ${lockParams.toString()}`
  )
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
