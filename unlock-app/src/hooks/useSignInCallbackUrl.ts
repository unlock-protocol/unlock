import { useSelector } from '@xstate/react'
import { useRouter } from 'next/router'
import { CheckoutService } from '~/components/interface/checkout/main/checkoutMachine'

const useSignInCallbackUrl = (
  shoudOpenConnectModal: boolean,
  checkoutService?: CheckoutService
) => {
  const router = useRouter()

  const context = useSelector(checkoutService, (state) => state?.context)

  const url = new URL(
    `${window.location.protocol}//${window.location.host}${router.asPath}`
  )
  const params = new URLSearchParams(url.search)
  params.append(
    'shouldOpenConnectModal',
    encodeURIComponent(shoudOpenConnectModal.toString())
  )
  if (context?.lock) {
    params.set('lock', encodeURIComponent(context.lock.address))
  }
  url.search = params.toString()

  return url.toString()
}

export default useSignInCallbackUrl
