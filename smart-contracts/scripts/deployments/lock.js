const { ethers } = require('hardhat')
const contracts = require('@unlock-protocol/contracts')

async function main({ unlockAddress, unlockVersion, serializedLock, salt }) {
  // get the right version of Unlock
  let Unlock
  if (!unlockVersion) {
    Unlock = await ethers.getContractFactory('Unlock')
  } else {
    const { abi, bytecode } = contracts[`UnlockV${unlockVersion}`]
    Unlock = await ethers.getContractFactory(abi, bytecode)
  }
  const unlock = Unlock.attach(unlockAddress)

  const { expirationDuration, tokenAddress, keyPrice, maxNumberOfKeys, name } =
    serializedLock

  const tx = await unlock.createLock(
    // _lock.beneficiary,
    expirationDuration,
    tokenAddress,
    keyPrice,
    maxNumberOfKeys,
    name,
    salt
  )

  // eslint-disable-next-line no-console
  console.log('CLONE LOCK > creating a new lock...')

  const { events, transactionHash } = await tx.wait()
  const { args } = events.find(({ event }) => event === 'NewLock')
  const { newLockAddress } = args

  // eslint-disable-next-line no-console
  console.log(
    `CLONE LOCK > deployed to : ${newLockAddress} (tx: ${transactionHash})`
  )

  // get versionof the original lock
  const publicLockVersion = 8 // await unlock.publicLockVersion()
  const { abi: publicLockABI, bytecode: publicLockBytecode } =
    contracts[`PublicLockV${publicLockVersion}`]
  const PublicLock = await ethers.getContractFactory(
    publicLockABI,
    publicLockBytecode
  )
  const lock = PublicLock.attach(newLockAddress)

  // check for default var
  if (
    serializedLock.freeTrialLength != 1000 ||
    serializedLock.newLock != 1000
  ) {
    lock.updateRefundPenalty(
      serializedLock.freeTrialLength,
      serializedLock.refundPenaltyBasisPoints
    )
  }

  if (serializedLock.transferFeeBasisPoints != 1000) {
    lock.updateTransferFee(serializedLock.transferFeeBasisPoints)
  }

  return newLockAddress
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
