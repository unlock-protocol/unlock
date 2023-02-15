import React, { useState } from 'react'
import { Modal } from '@unlock-protocol/ui'
import QRCode from 'qrcode.react'
import { DiAndroid as AndroidIcon, DiApple as AppleIcon } from 'react-icons/di'
import { createWalletPass, Platform } from '../../../services/ethpass'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { WalletService } from '@unlock-protocol/unlock-js'

const addToPhoneWallet = async (
  walletService: WalletService,
  lockAddress: string,
  tokenId: string,
  network: number,
  image: string,
  platform: Platform
): Promise<string> => {
  const signatureMessage = `Sign this message to generate your mobile wallet ${new Date().getTime()} pass for ${lockAddress}}`
  const signature = await walletService.signMessage(
    signatureMessage,
    'personal_sign'
  )

  const url = await createWalletPass({
    lockAddress,
    tokenId,
    network,
    signatureMessage,
    signature,
    image,
    platform,
  })
  return url
}

interface AddToWalletProps {
  network: number
  lockAddress: string
  tokenId: string
  image: string
}

export const AddToAppleWallet = ({
  lockAddress,
  tokenId,
  network,
  image,
}: AddToWalletProps) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false)
  const [passUrl, setPassUrl] = useState<string>()
  const { getWalletService } = useAuth()

  const handleClick = async () => {
    setModalOpen(true)
    const walletService = await getWalletService()
    const _passUrl = await addToPhoneWallet(
      walletService,
      lockAddress,
      tokenId,
      network,
      image,
      Platform.APPLE
    )
    setPassUrl(_passUrl)
  }
  return (
    <>
      <Modal isOpen={isModalOpen} setIsOpen={setModalOpen}>
        <div className="flex flex-col gap-3">
          {passUrl && <QRCode value={passUrl} size={256} includeMargin />}
          {!passUrl && <>Generating your pass...</>}
        </div>
      </Modal>
      <div onClick={handleClick}>
        <AppleIcon />
        Add to my Apple device
      </div>
    </>
  )
}

export const AddToGoogleWallet = ({
  lockAddress,
  tokenId,
  network,
  image,
}: AddToWalletProps) => {
  const { getWalletService } = useAuth()

  const handleClick = async () => {
    const generate = async () => {
      const walletService = await getWalletService()
      const passUrl = await addToPhoneWallet(
        walletService,
        lockAddress,
        tokenId,
        network,
        image,
        Platform.GOOGLE
      )
      window.open(passUrl, '_')
    }

    await ToastHelper.promise(generate(), {
      loading: 'Generating the pass!',
      success: 'Successfully generated!',
      error: `The pass could not generated. Please try again.`,
    })
  }

  return (
    <div onClick={handleClick}>
      <AndroidIcon />
      Add to my Google device
    </div>
  )
}
