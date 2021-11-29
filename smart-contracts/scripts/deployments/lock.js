const { ethers } = require('hardhat')
const contracts = require('@unlock-protocol/contracts')
const createLockHash = require('../../test/helpers/createLockCalldata')

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
  console.log('CLONE LOCK > creating a new lock...')

  let tx
  if (unlockVersion < 9) {
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
    tx = await unlock.createLock(calldata)
  }

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
  const { freeTrialLength, refundPenaltyBasisPoints, transferFeeBasisPoints } =
    serializedLock

  if (
    (freeTrialLength &&
      ethers.BigNumber.from(freeTrialLength).neq(
        await lock.freeTrialLength()
      )) ||
    (refundPenaltyBasisPoints &&
      ethers.BigNumber.from(refundPenaltyBasisPoints).neq(
        await lock.refundPenaltyBasisPoints()
      ))
  ) {
    lock.updateRefundPenalty(freeTrialLength, refundPenaltyBasisPoints)
  }

  if (
    transferFeeBasisPoints &&
    ethers.BigNumber.from(transferFeeBasisPoints).neq(
      await lock.transferFeeBasisPoints()
    )
  ) {
    lock.updateTransferFee(transferFeeBasisPoints)
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
