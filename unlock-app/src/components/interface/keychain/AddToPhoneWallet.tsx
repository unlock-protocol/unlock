import { createWalletPass, Platform } from '../../../services/ethpass'
import { DiAndroid as AndroidIcon, DiApple as AppleIcon } from 'react-icons/di'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import React, { useState } from 'react'
import { Modal } from '@unlock-protocol/ui'
import QRCode from 'qrcode.react'

interface AddToMobileDeviceWalletProps {
  network: number
  lockAddress: string
  tokenId: string
  image: string
  children?: React.ReactNode
  platform: Platform
  onSuccess: (url: string) => void
}

export const AddToMobileDeviceWallet = ({
  network,
  lockAddress,
  tokenId,
  image,
  children,
  onSuccess,
  platform,
}: AddToMobileDeviceWalletProps) => {
  const { getWalletService } = useAuth()

  const addToPhoneWallet = async () => {
    const generatePromise = async () => {
      const walletService = await getWalletService(network)
      const signatureMessage = `Sign this message to generate your mobile wallet ${new Date().getTime()} pass for ${lockAddress}}`
      const signature = await walletService.signMessage(
        signatureMessage,
        'personal_sign'
      )

      return createWalletPass({
        lockAddress,
        tokenId,
        network,
        signatureMessage,
        signature,
        image,
        platform,
      })
    }

    onSuccess(
      await ToastHelper.promise(generatePromise(), {
        loading: 'Generating the pass!',
        success: 'Successfully generated!',
        error: `The pass could not generated. Please try again.`,
      })
    )
  }

  return (
    <div className="flex w-full h-full" onClick={addToPhoneWallet}>
      {children}
    </div>
  )
}

interface AddToAppleWalletProps {
  network: number
  lockAddress: string
  tokenId: string
  image: string
}

export const AddToAppleWallet = (props: AddToAppleWalletProps) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false)
  const [passUrl, setPassUrl] = useState<string>()

  console.log(
    props,
    {
      isModalOpen,
      passUrl,
    },
    !!(isModalOpen && passUrl)
  )

  return (
    <>
      <Modal isOpen={isModalOpen} setIsOpen={setModalOpen}>
        <div className="flex flex-col gap-3">
          <div className="mx-auto">
            {passUrl && <QRCode value={passUrl} size={256} includeMargin />}
          </div>
        </div>
      </Modal>

      <AppleIcon />
      <AddToMobileDeviceWallet
        platform={Platform.APPLE}
        {...props}
        onSuccess={(passUrl) => {
          console.log(passUrl)
          setPassUrl(passUrl)
          setModalOpen(true)
          console.log('SOOO? OPEN!!')
        }}
      >
        Add to my Apple Device
      </AddToMobileDeviceWallet>
    </>
  )
}

interface AddToGoogleWalletProps {
  network: number
  lockAddress: string
  tokenId: string
  image: string
}

export const AddToGoogleWallet = (props: AddToGoogleWalletProps) => {
  const onSuccess = (passUrl: string) => {
    window.open(passUrl, '_')
  }

  return (
    <>
      <AndroidIcon />
      <AddToMobileDeviceWallet
        {...props}
        platform={Platform.GOOGLE}
        onSuccess={onSuccess}
      >
        Add to my Google Device
      </AddToMobileDeviceWallet>
    </>
  )
}
