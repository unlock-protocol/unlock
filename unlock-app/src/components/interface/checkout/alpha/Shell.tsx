import React, { ReactNode } from 'react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import * as Avatar from '@radix-ui/react-avatar'

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
          />
        </button>
      </div>
      {children}
    </div>
  )
}

interface FooterProps {
  children?: ReactNode
}

export function Footer({ children }: FooterProps) {
  return (
    <footer className="px-6 pt-6 pb-4 rounded-b-xl border-t border-gray-100 shadow">
      {children}
      <div className="flex mt-4 justify-center items-center">
        <p className="text-sm"> Powered by Unlock</p>
      </div>
    </footer>
  )
}

interface ContentProps {
  children?: ReactNode
}

export function Content({ children }: ContentProps) {
  return <main className="grid p-6 max-h-96 overflow-y-auto">{children}</main>
}

interface HeadProps {
  iconURL?: string
  title: string
  description: string
}

export function Head({ iconURL, title, description }: HeadProps) {
  return (
    <header className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar.Root className="inline-flex items-center justify-center w-16 h-16 rounded-full">
          <Avatar.Image src={iconURL} alt={title} width={64} height={64} />
          <Avatar.Fallback className="inline-flex border items-center justify-center w-16 h-16 rounded-full">
            {title.slice(0, 2).toUpperCase()}
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
  Footer,
  Head,
  Root,
  Content,
}
