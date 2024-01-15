const { ethers } = require('hardhat')
const contracts = require('@unlock-protocol/contracts')
const {
  createLockCalldata,
  getEvent,
  getLockVersion,
} = require('@unlock-protocol/hardhat-helpers')

const toBigNumber = (mayBN) => BigInt(mayBN.toString())

async function main({
  unlockAddress,
  unlockVersion,
  lockVersion,
  serializedLock,
  salt,
}) {
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
  console.log(
    `LOCK DEPLOY > creating a new lock (${
      lockVersion ? 'latest' : `v${lockVersion}`
    }) '${name}'...`
  )

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
    const calldata = await createLockCalldata({
      args: [expirationDuration, tokenAddress, keyPrice, maxNumberOfKeys, name],
      from: signer.address,
    })
    if (lockVersion) {
      tx = await unlock.createUpgradeableLockAtVersion(calldata, lockVersion)
    } else {
      tx = await unlock.createUpgradeableLock(calldata)
    }
  }

  const receipt = await tx.wait()
  const { args, hash } = await getEvent(receipt, 'NewLock')
  const { newLockAddress } = args

  // eslint-disable-next-line no-console
  console.log(`LOCK DEPLOY > deployed to : ${newLockAddress} (tx: ${hash})`)

  // get version of the original lock
  const publicLockVersion = await (
    await ethers.getContractAt(
      [`function publicLockVersion() view returns (uint16)`],
      newLockAddress
    )
  ).publicLockVersion()

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
      toBigNumber(freeTrialLength) !== (await lock.freeTrialLength())) ||
    (refundPenaltyBasisPoints &&
      toBigNumber(refundPenaltyBasisPoints) !==
        (await lock.refundPenaltyBasisPoints()))
  ) {
    lock.updateRefundPenalty(freeTrialLength, refundPenaltyBasisPoints)
  }

  if (
    transferFeeBasisPoints &&
    toBigNumber(transferFeeBasisPoints) !==
      (await lock.transferFeeBasisPoints())
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
