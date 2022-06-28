import React, { ReactNode } from 'react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import * as Avatar from '@radix-ui/react-avatar'
import { CheckoutPage, CheckoutService } from './Checkout/checkoutMachine'
import { useActor, useSelector } from '@xstate/react'
import { useCheckoutHeadContent } from './useCheckoutHeadContent'
import { ProgressIndicator } from './Progress'

interface RootProps {
  children?: ReactNode
  onClose(): void
}

export function Root({ children, onClose }: RootProps) {
  return (
    <div className="bg-white rounded-xl w-full max-w-md">
      <div className="flex justify-end mt-6 mr-6">
        <button
          onClick={() => onClose()}
          className="flex items-center justify-center rounded group"
          aria-label="Close"
          type="button"
        >
          <CloseIcon
            className="fill-black group-hover:fill-brand-ui-primary"
            size={24}
            key="close"
          />
        </button>
      </div>
      <div>{children}</div>
    </div>
  )
}

interface HeadProps {
  checkoutService: CheckoutService
}

export function Head({ checkoutService }: HeadProps) {
  const [state] = useActor(checkoutService)
  const paywallConfig = useSelector(
    checkoutService,
    (state) => state.context.paywallConfig
  )
  const matched = state.value.toString() as CheckoutPage
  const { icon, title } = paywallConfig
  const { description } = useCheckoutHeadContent(paywallConfig, matched)
  return (
    <header className="px-6 pt-6 space-y-4">
      <div className="flex items-center gap-4">
        <Avatar.Root className="inline-flex items-center justify-center w-16 h-16 rounded-full">
          <Avatar.Image src={icon} alt={title} width={64} height={64} />
          <Avatar.Fallback className="inline-flex border items-center justify-center w-16 h-16 rounded-full">
            {title?.slice(0, 2).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>
        <div>
          <h1 className="font-bold text-lg"> {title} </h1>
          <p className="text-base text-brand-dark"> Membership </p>
        </div>
      </div>
      <p className="text-base text-brand-dark">{description}</p>
      <ProgressIndicator checkoutService={checkoutService} />
    </header>
  )
}

export const Shell = {
  Head,
  Root,
}
