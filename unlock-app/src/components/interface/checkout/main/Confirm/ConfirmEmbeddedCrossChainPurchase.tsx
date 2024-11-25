import { CheckoutService } from '../checkoutMachine'
import { useConfig } from '~/utils/withConfig'
import { Fragment, useRef, useEffect } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useSelector } from '@xstate/react'
import ReCaptcha from 'react-google-recaptcha'
import {
  LoginModal as PrivyTransactionPrompt,
  usePrivy,
} from '@privy-io/react-auth'

interface Props {
  checkoutService: CheckoutService
  onConfirmed: (lock: string, network: number, hash?: string) => void
  onError: (message: string) => void
}

export function ConfirmEmbeddedCrossChainPurchase({
  checkoutService,
  onConfirmed,
}: Props) {
  const { lock, payment } = useSelector(
    checkoutService,
    (state) => state.context
  )

  const config = useConfig()
  const recaptchaRef = useRef<any>()

  const { sendTransaction } = usePrivy()

  const { address: lockAddress } = lock!

  // @ts-expect-error Property 'route' does not exist on type '{ method: "card"; cardId?: string | undefined; }'.
  const route = payment.route

  const onError = (error: any, message?: string) => {
    console.error(error)
    switch (error.code) {
      case -32000:
      case 4001:
      case 'ACTION_REJECTED':
        ToastHelper.error('Transaction rejected.')
        break
      case 'INSUFFICIENT_FUNDS':
        ToastHelper.error('Insufficient funds.')
        break
      default:
        ToastHelper.error(message || error?.error?.message || error.message)
    }
  }

  useEffect(() => {
    onConfirm()
  }, [])

  const onConfirm = async () => {
    try {
      // delete unwanted gas values
      delete route.tx.gasLimit
      delete route.tx.maxFeePerGas
      delete route.tx.maxPriorityFeePerGas

      let tx
      // Ensure the value prop of route.tx is a BigInt for embedded wallets
      const txParams = { ...route.tx }
      // Convert value to BigInt, handling different input formats
      if (txParams.value) {
        if (typeof txParams.value === 'string') {
          // Handle hex strings
          if (txParams.value.startsWith('0x')) {
            txParams.value = BigInt(txParams.value)
          } else {
            txParams.value = BigInt(txParams.value)
          }
        } else if (typeof txParams.value === 'number') {
          txParams.value = BigInt(txParams.value)
        }
        // If it's already a BigInt, no conversion needed

        tx = await sendTransaction(txParams)
        onConfirmed(lockAddress, route.network, tx.transactionHash)
      }
    } catch (error: any) {
      onError(error)
    }
  }

  return (
    <Fragment>
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />

      <main className="h-full p-6 py-0 space-y-2 overflow-auto">
        <PrivyTransactionPrompt open={true} />
      </main>
    </Fragment>
  )
}
