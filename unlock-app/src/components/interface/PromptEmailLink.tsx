'use client'

import { useLinkAccount } from '@privy-io/react-auth'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useModalStatus } from '@privy-io/react-auth'
import { useEffect } from 'react'

interface PromptEmailLinkProps {
  setModalOpen: (open: boolean) => void
}

export const PromptEmailLink = ({ setModalOpen }: PromptEmailLinkProps) => {
  const { isOpen } = useModalStatus()

  // Handle email linking
  const { linkEmail } = useLinkAccount({
    onSuccess: () => {
      setModalOpen(false)
      ToastHelper.success('Email added successfully')
    },
    onError: (error) => {
      setModalOpen(false)
      ToastHelper.error('Error linking email')
      console.error('Error linking email:', error)
    },
  })

  // Watch for Privy modal close and sync with our modal
  useEffect(() => {
    if (!isOpen) {
      setModalOpen(false)
    }
  }, [isOpen, setModalOpen])

  const handleLinkEmail = async () => {
    setModalOpen(true)
    try {
      await linkEmail()
    } catch (error) {
      setModalOpen(false)
      ToastHelper.error('Error initiating email link')
      console.error('Error initiating email link:', error)
    }
  }

  return (
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
  )
}
