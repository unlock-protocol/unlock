import React, { Fragment, ReactNode } from 'react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import * as Avatar from '@radix-ui/react-avatar'
import { Transition } from '@headlessui/react'

interface RootProps {
  children?: ReactNode
  onClose(): void
}

export function Root({ children, onClose }: RootProps) {
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
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex justify-end mt-6 mr-6">
          <button
            onClick={(event) => {
              event.preventDefault()
              onClose()
            }}
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
    </Transition>
  )
}

interface HeadProps {
  title?: string
  description: string
  iconURL?: string
}

export function Head({ title, description, iconURL }: HeadProps) {
  return (
    <header className="px-6 pt-6 space-y-4">
      <div className="flex items-center gap-4">
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
      <p className="text-base text-brand-dark">{description}</p>
    </header>
  )
}

export const Shell = {
  Head,
  Root,
}
