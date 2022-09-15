import React, {
  Fragment,
  MouseEventHandler,
  ReactNode,
  forwardRef,
} from 'react'
import {
  RiCloseLine as CloseIcon,
  RiArrowLeftLine as BackIcon,
} from 'react-icons/ri'
import * as Avatar from '@radix-ui/react-avatar'
import SvgComponents from '../../svg'
import mintingAnimation from '~/animations/minting.json'
import mintedAnimation from '~/animations/minted.json'
import errorAnimation from '~/animations/error.json'
import Lottie from 'lottie-react'
import { Transaction } from './Checkout/checkoutMachine'

interface ButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>
}

export const CloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
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
    )
  }
)

CloseButton.displayName = 'Close Button'

export const BackButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className="flex items-center justify-center rounded group"
        aria-label="Close"
        type="button"
      >
        <BackIcon
          className="fill-black group-hover:fill-brand-ui-primary"
          size={24}
          key="close"
        />
      </button>
    )
  }
)

BackButton.displayName = 'Back Button'

interface CheckoutTransitionProps {
  children?: ReactNode
}

export const CheckoutTransition = ({ children }: CheckoutTransitionProps) => {
  return <Fragment>{children}</Fragment>
}

interface CheckoutHeadProps {
  title?: string
  iconURL?: string
}

export function CheckoutHead({ title, iconURL }: CheckoutHeadProps) {
  return (
    <header className="px-6 py-2 space-y-2">
      <div className="inset-0 flex flex-wrap items-center flex-1 gap-6">
        <Avatar.Root>
          <Avatar.Image
            className="inline-flex items-center justify-center w-16 h-16 rounded-full"
            src={iconURL}
            alt={title}
            width={64}
            height={64}
          />
          <Avatar.Fallback>
            <SvgComponents.UnlockMonogram
              className="rounded-full"
              height={64}
              width={64}
            />
          </Avatar.Fallback>
        </Avatar.Root>
        <div>
          <h1 className="text-lg font-bold"> {title || 'Unlock Protocol'} </h1>
          <p className="text-base text-brand-dark"> Membership </p>
        </div>
      </div>
    </header>
  )
}

interface NavigationProps {
  onClose?(): void
  onBack?(): void
}

export function TopNavigation({ onClose, onBack }: NavigationProps) {
  const navigationClass = `flex items-center p-6 ${
    onBack ? 'justify-between' : 'justify-end'
  }`
  return (
    <div className={navigationClass}>
      {onBack && <BackButton onClick={() => onBack()} />}
      {onClose && <CloseButton onClick={() => onClose()} />}
    </div>
  )
}

export function TransactionAnimation({ status }: Partial<Transaction>) {
  const animationClass = `w-28 sm:w-36 h-28 sm:h-36`
  switch (status) {
    case 'PROCESSING':
      return (
        <Lottie
          className={animationClass}
          loop
          animationData={mintingAnimation}
        />
      )
    case 'FINISHED':
      return (
        <Lottie className={animationClass} animationData={mintedAnimation} />
      )
    case 'ERROR': {
      return (
        <Lottie className={animationClass} animationData={errorAnimation} />
      )
    }
    default:
      return null
  }
}
