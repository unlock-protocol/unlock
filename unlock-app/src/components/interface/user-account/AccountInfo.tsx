import {
  LoginModal,
  usePrivy,
  useLinkAccount,
  useUpdateAccount,
} from '@privy-io/react-auth'
import { useState } from 'react'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { Button, Modal } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { SettingCard } from '../locks/Settings/elements/SettingCard'
import { WrappedAddress } from '../WrappedAddress'

export const AccountInfo = () => {
  const { account, privyReady } = useAuthenticate()
  const { user } = usePrivy()
  const [showEmailModal, setShowEmailModal] = useState(false)

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
    <div className="space-y-5">
      <SettingCard
        label="Wallet Address"
        description="Your wallet address is the unique identifier for your account."
        defaultOpen={true}
      >
        <span className="flex h-5 mx-1 my-3 text-black text-sm md:text-base">
          <WrappedAddress
            className="mx-2 font-semibold text-base"
            addressType="wallet"
            minified={false}
            address={account!}
          />
        </span>
      </SettingCard>

      <SettingCard
        label="Email"
        description="Your email address is used to send you notifications and receipts."
        defaultOpen={true}
      >
        <div className="flex flex-col gap-4 space-y-4">
          <span className="flex h-5 mx-1 text-black text-sm font-semibold md:text-base">
            {user?.email?.address || 'No email added yet'}
          </span>
          {user?.email?.address ? (
            <Button
              className="w-full md:w-1/3"
              onClick={handleUpdateEmail}
              disabled={!privyReady}
            >
              Update Email
            </Button>
          ) : (
            <Button
              className="w-full md:w-1/3"
              onClick={handleLinkEmail}
              disabled={!privyReady}
            >
              Link Email
            </Button>
          )}
        </div>
      </SettingCard>

      <Modal isOpen={showEmailModal} setIsOpen={setShowEmailModal} size="small">
        <LoginModal open={showEmailModal} />
      </Modal>
    </div>
  )
}

export default AccountInfo
