import { ActionType } from 'hardhat/types'
import type { LockArgs } from './Unlock'

export const deployLockTask: ActionType<LockArgs> = async (
  {
    name,
    keyPrice,
    expirationDuration,
    currencyContractAddress,
    maxNumberOfKeys,
  },
  { unlock }
): Promise<string> => {
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

export default deployLockTask
