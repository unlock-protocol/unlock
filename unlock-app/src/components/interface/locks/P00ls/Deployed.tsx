import { useCheckoutConfigsByUserAndLock } from '~/hooks/useCheckoutConfig'
import { CheckoutShareOrDownload } from '../CheckoutUrl/elements/CheckoutPreview'
import { getCheckoutUrl } from '~/components/content/event/utils'
import Link from 'next/link'
import { CheckoutConfig } from '@unlock-protocol/core'

export const Deployed = ({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) => {
  const { data: checkoutConfigs } = useCheckoutConfigsByUserAndLock({
    lockAddress,
  })
  const checkoutConfig = checkoutConfigs?.[0]

  const checkoutUrl = checkoutConfig
    ? getCheckoutUrl(checkoutConfig as CheckoutConfig)
    : undefined

  return (
    <div className="prose">
      <h1 className="text-2xl">Your Membership contract is deployed!</h1>
      <p>
        Great! You already have deployed your membership contract!{' '}
        <Link href={`/locks/lock?address=${lockAddress}&network=${network}`}>
          Go manage it
        </Link>
        !
      </p>
      <p>
        Protip: This is an NFT contract... you can use it to token gate content
        on plaftorms like Paragaph, WordPress or Bonfire or even token gate
        access to Discord servers and Telegram groups!
      </p>
      {checkoutConfig && checkoutUrl && (
        <>
          <p>
            You can also starting sharing this{' '}
            <Link href={checkoutUrl}>checkout URL</Link> for people to buy your
            memberships!
          </p>
          <CheckoutShareOrDownload
            paywallConfig={checkoutConfig.config}
            checkoutUrl={checkoutUrl}
            size="medium"
          />
        </>
      )}
    </div>
  )
}
