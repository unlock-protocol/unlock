import { Button } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { Checkout } from '~/components/interface/checkout/main'
import { selectProvider } from '~/hooks/useAuthenticate'
import { PaywallConfig } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import FileSaver from 'file-saver'

interface CheckoutPreviewProps {
  paywallConfig?: PaywallConfig
}

const onDownloadJson = (paywallConfig: PaywallConfig) => {
  const fileName = 'paywall-config.json'

  // Create a blob of the data
  const fileToSave = new Blob([JSON.stringify(paywallConfig)], {
    type: 'application/json',
  })

  FileSaver.saveAs(fileToSave, fileName)
}
export const CheckoutPreview = ({ paywallConfig }: CheckoutPreviewProps) => {
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const config = useConfig()

  const injectedProvider = selectProvider(config)

  const hasLocks = Object.entries(paywallConfig?.locks ?? {})?.length > 0

  useEffect(() => {
    const url = new URL(`${window.location.origin}/checkout`)

    // remove redirectUri if not valorized
    if (paywallConfig?.redirectUri?.length === 0) {
      delete paywallConfig.redirectUri
    }

    url.searchParams.append('paywallConfig', JSON.stringify(paywallConfig))

    setCheckoutUrl(url.toString())
  }, [paywallConfig])

  const [_isCopied, setCopied] = useClipboard(checkoutUrl, {
    successDuration: 2000,
  })

  const buttonVariant = hasLocks ? 'primary' : 'outlined-primary'

  return (
    <div className="flex items-center justify-center w-full px-2 py-10 bg-gray-300 rounded-3xl">
      <div className="flex items-center justify-center w-full max-w-lg">
        {paywallConfig && (
          <div className="flex flex-col items-center w-full gap-4">
            <Checkout
              injectedProvider={injectedProvider as any}
              paywallConfig={paywallConfig as any}
            />
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm">
                {hasLocks
                  ? ' This checkout modal is ready for you to use.'
                  : 'A Lock is required in order to see the full preview.'}
              </span>
              <div className="flex gap-3">
                <Button
                  size="small"
                  variant={buttonVariant}
                  disabled={!hasLocks}
                  onClick={() => {
                    setCopied()
                    ToastHelper.success('URL copied')
                  }}
                >
                  Copy URL
                </Button>
                <Button
                  size="small"
                  variant={buttonVariant}
                  disabled={!hasLocks}
                  onClick={() => onDownloadJson(paywallConfig)}
                >
                  Download JSON
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
