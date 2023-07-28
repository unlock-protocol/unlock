import { useQuery } from '@tanstack/react-query'
import {
  formattedKeyPrice,
  convertedKeyPrice,
  lockKeysAvailable,
  numberOfAvailableKeys,
} from '~/utils/checkoutLockUtils'
import { durationsAsTextFromSeconds } from '~/utils/durations'

interface GetLockProps {
  lock: any
  baseCurrencySymbol: string
  numberOfRecipients?: number
}

interface LockPropsResult {
  name: string
  address: string
  network: number
  prepend: string
  isSoldOut?: boolean
  formattedKeysAvailable?: string
  convertedKeyPrice?: string
  formattedKeyPrice?: string
  formattedDuration?: string
}

export function useGetLockProps({
  lock,
  baseCurrencySymbol,
  numberOfRecipients = 1,
}: GetLockProps) {
  const { name, address, network } = lock ?? {}

  return useQuery(
    ['getLockProps', lock?.address, lock?.network, numberOfRecipients],
    async (): Promise<LockPropsResult> => {
      const keyPriceConverted = await convertedKeyPrice(
        lock,
        numberOfRecipients
      )
      return {
        formattedDuration: durationsAsTextFromSeconds(lock.expirationDuration),
        formattedKeyPrice: formattedKeyPrice(
          lock,
          baseCurrencySymbol,
          numberOfRecipients
        ),
        convertedKeyPrice: keyPriceConverted,
        formattedKeysAvailable: lockKeysAvailable(lock),
        name,
        address,
        network,
        prepend: numberOfRecipients > 1 ? `${numberOfRecipients} x ` : '',
        isSoldOut: numberOfAvailableKeys(lock) <= 0,
      }
    }
  )
}
