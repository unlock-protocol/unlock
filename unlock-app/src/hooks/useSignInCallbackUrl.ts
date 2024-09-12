import { useSelector } from '@xstate/react'
import { useSearchParams } from 'next/navigation'
import { CheckoutService } from '~/components/interface/checkout/main/checkoutMachine'

const useSignInCallbackUrl = (
  shoudOpenConnectModal: boolean,
  checkoutService?: CheckoutService
) => {
  const searchParams = useSearchParams()
  const context = useSelector(checkoutService, (state) => state?.context)

  const params = new URLSearchParams(searchParams.toString())
  params.append(
    'shouldOpenConnectModal',
    encodeURIComponent(shoudOpenConnectModal.toString())
  )
  if (context?.lock) {
    params.set('lock', encodeURIComponent(context.lock.address))
  }

  const url = new URL(window.location.origin)
  url.search = params.toString()

  return url.toString()
}

export default useSignInCallbackUrl
