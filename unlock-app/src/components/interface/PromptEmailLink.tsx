'use client'

import { Modal } from '@unlock-protocol/ui'
import { useState } from 'react'
import { LoginModal, useLinkAccount } from '@privy-io/react-auth'
import { ToastHelper } from '~/components/helpers/toast.helper'

export const PromptEmailLink = () => {
  const [showModal, setShowModal] = useState(false)

  // Handle email linking
  const { linkEmail } = useLinkAccount({
    onSuccess: () => {
      setShowModal(false)
      ToastHelper.success('Email added successfully')
    },
    onError: (error) => {
      ToastHelper.error('Error linking email')
      console.error('Error linking email:', error)
    },
  })

  const handleLinkEmail = () => {
    setShowModal(true)
    linkEmail()
  }

  return (
    <>
      <div
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleLinkEmail()
        }}
        className="flex flex-col gap-1 cursor-pointer"
      >
        <div className="font-medium">Email Address</div>
        <div className="text-sm text-gray-500">
          Add your email address to fully experience the Unlock platform.
        </div>
      </div>

      {showModal && (
        <Modal isOpen={showModal} setIsOpen={setShowModal} size="small">
          <LoginModal open={true} />
        </Modal>
      )}
    </>
  )
}
