'use client'

import { useConnectModal } from '~/hooks/useConnectModal'
import { Modal } from '@unlock-protocol/ui'
import { LoginModal } from '@privy-io/react-auth'
import { useEffect } from 'react'

export const ConnectModal = () => {
  const { closeConnectModal, open } = useConnectModal()

  useEffect(() => {
    const handleLoginComplete = () => {
      closeConnectModal()
    }

    window.addEventListener('locksmith.authenticated', handleLoginComplete)
    return () => {
      window.removeEventListener('locksmith.authenticated', handleLoginComplete)
    }
  }, [closeConnectModal])

  return (
    <Modal isOpen={open} setIsOpen={closeConnectModal} size="small">
      <div className="z-10 w-full max-w-sm bg-white rounded-2xl">
        <LoginModal open={open} />
      </div>
    </Modal>
  )
}
