import { useQuery } from '@tanstack/react-query'
import { fetchRecipientsData } from '~/components/interface/checkout/main/utils'
import { PaywallConfig } from '~/unlockTypes'

interface Options {
  lockAddress: string
  network: number
  promo?: string[]
  password?: string[]
  captcha?: string[]
  recipients: string[]
  paywallConfig: PaywallConfig
}

export const usePurchaseData = ({
  lockAddress,
  network,
  promo,
  password,
  captcha,
  recipients,
  paywallConfig,
}: Options) => {
  return useQuery(
    [
      'purchaseData',
      network,
      lockAddress,
      paywallConfig,
      recipients,
      promo,
      password,
      captcha,
    ],
    async () => {
      let purchaseData =
        promo ||
        password ||
        captcha ||
        Array.from({ length: recipients.length })
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
