import React, { ReactNode } from 'react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'

interface Props {
  children: ReactNode
  onClose(): void
}

export function Shell({ children = null, onClose }: Props) {
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
