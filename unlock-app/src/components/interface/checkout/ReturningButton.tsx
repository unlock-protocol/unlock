import type { ForwardedRef, InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { useActor } from '@xstate/react'
import { CheckoutService } from './main/checkoutMachine'
import { Button } from '@unlock-protocol/ui'

interface ReturningButtonProps
  extends Omit<InputHTMLAttributes<HTMLButtonElement>, 'type' | 'id' | 'size'> {
  loadingLabel?: string
  returnLabel?: string
  loading?: boolean
  checkoutService: CheckoutService
  onClick: () => void
}

export const ReturningButton = forwardRef(
  (props: ReturningButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const {
      loadingLabel = 'Minting your membership',
      returnLabel = 'Return to site',
      loading,
      disabled = false,
      checkoutService,
      onClick,
      ...restProps
    } = props
    const [state] = useActor(checkoutService)
    const { paywallConfig } = state.context

    const endingCallToAction = paywallConfig?.endingCallToAction || returnLabel

    return (
      <Button
        as="button"
        {...restProps}
        disabled={disabled}
        loading={loading}
        onClick={onClick}
        className="w-full"
        ref={ref}
      >
        {loading ? loadingLabel : endingCallToAction}
      </Button>
    )
  }
)

ReturningButton.displayName = 'ReturningButton'
