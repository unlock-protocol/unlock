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
import { Transition } from '@headlessui/react'

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
  return (
    <Transition
      as={Fragment}
      appear={true}
      show={!!children}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1"
    >
      {children}
    </Transition>
  )
}

interface CheckoutHeadProps {
  title?: string
  description: string
  iconURL?: string
}

export function CheckoutHead({
  title,
  description,
  iconURL,
}: CheckoutHeadProps) {
  return (
    <header className="px-6 py-2 space-y-2">
      <div className="flex flex-1 inset-0 flex-wrap items-center gap-6">
        <Avatar.Root>
          <Avatar.Image
            className="inline-flex items-center justify-center w-16 h-16 rounded-full"
            src={iconURL}
            alt={title}
            width={64}
            height={64}
          />
          <Avatar.Fallback className="inline-flex border items-center justify-center w-16 h-16 rounded-full">
            {title?.slice(0, 2).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>
        <div>
          <h1 className="font-bold text-lg"> {title} </h1>
          <p className="text-base text-brand-dark"> Membership </p>
        </div>
      </div>
      <p className="text-base text-brand-dark overflow line-clamp-2 h-12">
        {description}
      </p>
    </header>
  )
}
