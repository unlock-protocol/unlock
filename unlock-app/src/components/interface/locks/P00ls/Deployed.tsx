import { useCheckoutConfigsByUserAndLock } from '~/hooks/useCheckoutConfig'
import { CheckoutShareOrDownload } from '../CheckoutUrl/elements/CheckoutPreview'

export const Deployed = ({ lockAddress, network }) => {
  const { data: checkoutConfigs } = useCheckoutConfigsByUserAndLock({
    lockAddress,
  })
  console.log(checkoutConfigs)

  console.log(checkoutConfigs)
  const checkoutConfig = checkoutConfigs?.[0]
  return (
    <>
      <p>
        Great! You already have deployed your membership contract! Go manage it!
        You can also starting sharing a checkout URL for people to buy your
        memberships!
      </p>
      <p>
        OPS: This is an NFT contract... you can use it to token gate content in
        plaftorms like ...x
      </p>
      {checkoutConfig && (
        <CheckoutShareOrDownload
          paywallConfig={checkoutConfig.config}
          checkoutUrl={'checkoutUrl'}
          setCheckoutUrl={() => {}}
          size="medium"
          id={checkoutConfig.id}
        />
      )}
    </>
  )
}
