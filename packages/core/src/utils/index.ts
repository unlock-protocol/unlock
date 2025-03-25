import { z } from 'zod'
import { ZeroAddress } from 'ethers'

const LockTypeSchema = z.object({
  isEvent: z.boolean().default(false),
  isCertification: z.boolean().default(false),
  isStamp: z.boolean().default(false),
})

export const getLockTypeByMetadata = (metadata?: any): LockType => {
  const attributes: Record<string, string>[] = metadata?.attributes || []

  const hasAttribute = (name: 'event' | 'certification' | 'stamp') => {
    return attributes.some((attribute: { trait_type?: string }) =>
      attribute?.trait_type?.startsWith(name)
    )
  }

  return {
    isEvent: hasAttribute('event'),
    isCertification: hasAttribute('certification'),
    isStamp: hasAttribute('stamp'),
  }
}
export type LockType = z.infer<typeof LockTypeSchema>

/**
 * Determines if a lock is a subscription-type lock
 * @param lock - The lock object
 * @returns boolean - True if the lock is a subscription
 */
export const isLockForSub = (
  lock:
    | {
        keyPrice?: string
        currencyContractAddress?: string | null
        expirationDuration?: number
      }
    | null
    | undefined
): boolean => {
  if (!lock) return false

  const isFree = Number(lock?.keyPrice) === 0
  const isNative =
    !lock?.currencyContractAddress ||
    lock.currencyContractAddress === ZeroAddress
  const isExpiring =
    typeof lock.expirationDuration === 'number' &&
    lock.expirationDuration !== -1 &&
    lock.expirationDuration < 60 * 60 * 24 * 365 * 100

  if (isFree || isNative || !isExpiring) {
    return false
  }

  return true
}
