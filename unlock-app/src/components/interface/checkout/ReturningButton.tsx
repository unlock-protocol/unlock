import { useActor } from '@xstate/react'
import { CheckoutService } from './main/checkoutMachine'
import { Button } from '@unlock-protocol/ui'

interface ReturningButtonProps {
  loadingLabel?: string
  returnLabel?: string
  loading?: boolean
  disabled?: boolean
  checkoutService: CheckoutService
  onClick: () => void
}

export const ReturningButton = ({
  loadingLabel = 'Minting your membership',
  returnLabel = 'Return to site',
  loading,
  disabled = false,
  checkoutService,
  onClick,
}: ReturningButtonProps) => {
  const [state] = useActor(checkoutService)
  const { paywallConfig } = state.context

  const endingCallToAction = paywallConfig?.endingCallToAction || returnLabel

  return (
    <Button
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      className="w-full"
    >
      {loading ? loadingLabel : endingCallToAction}
    </Button>
  )
}
