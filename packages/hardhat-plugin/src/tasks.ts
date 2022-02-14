import { ActionType } from 'hardhat/types'
import type { LockArgs, UnlockHRE } from './Unlock'
import { UNLOCK_LATEST_VERSION, PUBLIC_LOCK_LATEST_VERSION } from './constants'

interface CreateLockTaskArgs extends LockArgs {
  unlockContract?: string
}

export const deployLockTask: ActionType<CreateLockTaskArgs> = async (
  {
    name,
    keyPrice,
    expirationDuration,
    currencyContractAddress,
    maxNumberOfKeys,
    unlockContract,
  },
  { unlock }
): Promise<string> => {
  // set unlock contract to a specified address
  if (unlockContract) {
    await unlock.setUnlock(unlockContract)
  }
  const { lock, transactionHash } = await unlock.createLock({
    name,
    keyPrice,
    expirationDuration,
    currencyContractAddress,
    maxNumberOfKeys,
  })

  // eslint-disable-next-line no-console
  console.log(
    `LOCK CREATED > deployed to : ${lock.address} (tx: ${transactionHash})`
  )
  return lock.address
}

export const deployUnlockProtocol = async (
  {
    unlockVersion = UNLOCK_LATEST_VERSION,
    lockVersion = PUBLIC_LOCK_LATEST_VERSION,
    confirmations = 5,
  },
  { deployProtocol }: UnlockHRE
): Promise<void> => {
  await deployProtocol(unlockVersion, lockVersion, confirmations)
}
