import type { ForwardedRef, InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { useActor, useSelector } from '@xstate/reactv4'
import { CheckoutService } from './main/checkoutMachine'
import { Button } from '@unlock-protocol/ui'
import { Actor, ActorRef } from 'xsatev5'

interface ReturningButtonProps
  extends Omit<InputHTMLAttributes<HTMLButtonElement>, 'type' | 'id' | 'size'> {
  loadingLabel?: string
  returnLabel?: string
  loading?: boolean
  checkoutService: ActorRef<any, any>
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
    const state = useSelector(checkoutService, (s) => s)
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
