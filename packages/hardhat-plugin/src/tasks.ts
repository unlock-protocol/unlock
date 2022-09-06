import { ActionType } from 'hardhat/types'
import { createLock } from './createLock'
import type { CreateLockArgs } from './createLock'

interface CreateLockTaskArgs extends CreateLockArgs {
  unlockContract?: string
}

export const deployLockTask: ActionType<CreateLockTaskArgs> = async (
  {
    name,
    keyPrice,
    expirationDuration,
    currencyContractAddress,
    maxNumberOfKeys,
  },
  hre
): Promise<string> => {
  const { lock, transactionHash } = await createLock(hre, {
    name,
    keyPrice,
    expirationDuration,
    currencyContractAddress,
    maxNumberOfKeys,
  })

  console.log(
    `LOCK CREATED > deployed to : ${lock.address} (tx: ${transactionHash})`
  )
  return lock.address
}

// export const deployUnlockProtocol = async (
//   {
//     unlockVersion = UNLOCK_LATEST_VERSION,
//     lockVersion = PUBLIC_LOCK_LATEST_VERSION,
//     confirmations = 5,
//   },
//   { deployProtocol }: UnlockHRE
// ): Promise<void> => {
//   await deployProtocol(unlockVersion, lockVersion, confirmations)
// }
