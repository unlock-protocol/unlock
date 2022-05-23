const { ethers } = require('hardhat')
const contracts = require('@unlock-protocol/contracts')
const createLockHash = require('../../test/helpers/createLockCalldata')

const toBigNumber = (mayBN) =>
  ethers.BigNumber.isBigNumber(mayBN) ? mayBN : ethers.BigNumber.from(mayBN)

async function main({ unlockAddress, unlockVersion, serializedLock, salt }) {
  const [signer] = await ethers.getSigners()
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

  // eslint-disable-next-line no-console
  console.log(`LOCK DEPLOY > creating a new lock '${name}'...`)

  let tx
  if (unlockVersion < 10) {
    tx = await unlock.createLock(
      expirationDuration,
      tokenAddress,
      keyPrice,
      maxNumberOfKeys,
      name,
      salt
    )
  } else {
    const calldata = await createLockHash({
      args: [expirationDuration, tokenAddress, keyPrice, maxNumberOfKeys, name],
      from: signer.address,
    })
    tx = await unlock.createUpgradeableLock(calldata)
  }

  const { events, transactionHash } = await tx.wait()
  const { args } = events.find(({ event }) => event === 'NewLock')
  const { newLockAddress } = args

  // eslint-disable-next-line no-console
  console.log(
    `LOCK DEPLOY > deployed to : ${newLockAddress} (tx: ${transactionHash})`
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
  const { freeTrialLength, refundPenaltyBasisPoints, transferFeeBasisPoints } =
    serializedLock

  if (
    (freeTrialLength &&
      !toBigNumber(freeTrialLength).eq(await lock.freeTrialLength())) ||
    (refundPenaltyBasisPoints &&
      !toBigNumber(refundPenaltyBasisPoints).eq(
        await lock.refundPenaltyBasisPoints()
      ))
  ) {
    lock.updateRefundPenalty(freeTrialLength, refundPenaltyBasisPoints)
  }

  if (
    transferFeeBasisPoints &&
    !toBigNumber(transferFeeBasisPoints).eq(await lock.transferFeeBasisPoints())
  ) {
    lock.updateTransferFee(transferFeeBasisPoints)
  }

  return newLockAddress
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
