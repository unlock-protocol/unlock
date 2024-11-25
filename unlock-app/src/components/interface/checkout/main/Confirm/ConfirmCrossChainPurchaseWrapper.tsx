import { CheckoutService } from '../checkoutMachine'
import { useSelector } from '@xstate/react'
import { usePrivy } from '@privy-io/react-auth'
import { useEmbeddedWallet } from '~/hooks/useEmbeddedWallet'
import { ConfirmCrossChainPurchase } from './ConfirmCrossChainPurchase'
import { PrivyTransactionPromptWrapper } from '../embedded-wallet/PrivyTransactionPromptWrapper'

interface Props {
  checkoutService: CheckoutService
  onConfirmed: (lock: string, network: number, hash?: string) => void
  onError: (message: string) => void
}

export function ConfirmCrossChainPurchaseWrapper({
  checkoutService,
  onConfirmed,
  onError,
}: Props) {
  const { isEmbeddedWallet } = useEmbeddedWallet()
  const { lock, payment } = useSelector(
    checkoutService,
    (state) => state.context
  )
  const { sendTransaction } = usePrivy()

  // @ts-expect-error Property 'route' does not exist
  const route = payment.route
  const { address: lockAddress } = lock!

  // handle embedded wallet confirmation
  const handleEmbeddedWalletConfirm = async () => {
    try {
      // delete unwanted gas values
      delete route.tx.gasLimit
      delete route.tx.maxFeePerGas
      delete route.tx.maxPriorityFeePerGas

      const txParams = { ...route.tx }
      // Convert value to BigInt if needed
      if (txParams.value) {
        if (typeof txParams.value === 'string') {
          txParams.value = txParams.value.startsWith('0x')
            ? BigInt(txParams.value)
            : BigInt(txParams.value)
        } else if (typeof txParams.value === 'number') {
          txParams.value = BigInt(txParams.value)
        }
      }
      const tx = await sendTransaction(txParams)
      onConfirmed(lockAddress, route.network, tx.transactionHash)
    } catch (error: any) {
      onError(error)
    }
  }

  // Render different components based on wallet type
  if (isEmbeddedWallet) {
    return (
      <PrivyTransactionPromptWrapper
        transactionFunction={handleEmbeddedWalletConfirm}
      />
    )
  }

  return (
    <ConfirmCrossChainPurchase
      checkoutService={checkoutService}
      onConfirmed={onConfirmed}
      onError={onError}
    />
  )
}
