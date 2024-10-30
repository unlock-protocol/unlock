import {
  LoginModal,
  usePrivy,
  useLinkAccount,
  useUpdateAccount,
} from '@privy-io/react-auth'
import { useState } from 'react'
import { Item } from './styles'
import useEns from '../../../hooks/useEns'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { Button, Modal } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'

export const AccountInfo = () => {
  const { account, privyReady } = useAuthenticate()
  const { user } = usePrivy()
  const [showEmailModal, setShowEmailModal] = useState(false)
  const name = useEns(account || '')

  const { linkEmail } = useLinkAccount({
    onSuccess: () => {
      setShowEmailModal(false)
      ToastHelper.success('Email added successfully')
    },
    onError: (error) => {
      ToastHelper.error('Error linking email')
      console.error('Error linking email:', error)
    },
  })

  const { updateEmail } = useUpdateAccount({
    onSuccess: () => {
      setShowEmailModal(false)
      ToastHelper.success('Email updated successfully')
    },
    onError: (error) => {
      ToastHelper.error('Error updating email')
      console.error('Error updating email:', error)
    },
  })

  const handleUpdateEmail = () => {
    setShowEmailModal(true)
    updateEmail()
  }

  const handleLinkEmail = () => {
    setShowEmailModal(true)
    linkEmail()
  }

  return (
    <div className="max-w-4xl mt-10">
      <h2 className="text-base font-bold leading-5 mb-4">Account</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Item title="Wallet Address" count="half">
          <span className="flex h-5 mx-1 my-3 text-black text-sm md:text-base">
            {account} {name !== account ? `(${name})` : ''}
          </span>
        </Item>
        <Item title="Email" count="half">
          <div className="flex justify-between items-center">
            <span className="flex h-5 mx-1 my-3 text-black text-sm md:text-base">
              {user?.email?.address || 'No email added yet'}
            </span>
            {user?.email?.address ? (
              <Button
                size="small"
                onClick={handleUpdateEmail}
                disabled={!privyReady}
              >
                Update Email
              </Button>
            ) : (
              <Button
                size="small"
                onClick={handleLinkEmail}
                disabled={!privyReady}
              >
                Link Email
              </Button>
            )}
          </div>
        </Item>
      </div>

      <Modal isOpen={showEmailModal} setIsOpen={setShowEmailModal} size="small">
        <LoginModal open={showEmailModal} />
      </Modal>
    </div>
  )
}

export default AccountInfo
