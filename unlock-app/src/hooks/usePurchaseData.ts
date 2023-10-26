import { useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { fetchRecipientsData } from '~/components/interface/checkout/main/utils'

interface Options {
  lockAddress: string
  network: number
  data?: string[]
  recipients: string[]
  paywallConfig: PaywallConfigType
}

export const usePurchaseData = ({
  lockAddress,
  network,
  data,
  recipients,
  paywallConfig,
}: Options) => {
  return useQuery(
    ['purchaseData', network, lockAddress, paywallConfig, recipients, data],
    async () => {
      // promo, password, captcha are mutually exclusive and and are in fact arrays of promo codes,
      // passwords, or captchas for each recipient.
      let purchaseData =
        data || Array.from({ length: recipients.length }).map(() => '0x')

      const dataBuilder =
        paywallConfig.locks[lockAddress].dataBuilder ||
        paywallConfig.dataBuilder
      // if Data builder url is present, prioritize that above rest.
      if (dataBuilder) {
        const delegatedData = await fetchRecipientsData(dataBuilder, {
          recipients,
          lockAddress,
          network,
        })
        if (delegatedData) {
          purchaseData = delegatedData
        }
      }
      return purchaseData
    },
    {
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onError(error) {
        console.error(error)
      },
    }
  )
}
