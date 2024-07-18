import { Box, Modal, Size } from '@unlock-protocol/ui'
import QRCode from 'qrcode.react'
import {
  generateAppleWalletPass,
  generateGoogleWalletPass,
  Platform,
} from '../../../services/passService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import Image from 'next/image'

interface ApplePassModalProps {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  applePassUrl?: string
}

export const ApplePassModal = ({
  isOpen,
  setIsOpen,
  applePassUrl,
}: ApplePassModalProps) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {applePassUrl ? (
        <div className="flex flex-col items-center">
          <p>
            Please scan this QR code with your phone or{' '}
            <a href={applePassUrl} className="underline">
              click here to download it
            </a>
            .
          </p>
          <QRCode value={applePassUrl} size={256} includeMargin />
        </div>
      ) : (
        <p>Generating your pass...</p>
      )}
    </Modal>
  )
}

interface AddToWalletProps {
  platform: Platform
  as: React.ElementType
  network: number
  lockAddress: string
  tokenId: string
  handlePassUrl: (url: string) => void
  disabled?: boolean
  active?: boolean
  minimised?: boolean
  iconLeft?: JSX.Element
  size?: Size
  variant?: string
  className?: string
}

export const AddToPhoneWallet = ({
  as,
  lockAddress,
  tokenId,
  network,
  handlePassUrl,
  platform,
  minimised,
  ...rest
}: AddToWalletProps) => {
  const walletConfig = {
    [Platform.APPLE]: {
      generatePass: generateAppleWalletPass,
      imgSrc: `/images/illustrations/apple-wallet.svg`,
      altText: 'Apple Wallet',
      loadingMessage:
        'Generating your Apple Wallet pass. This takes a few seconds.',
    },
    [Platform.GOOGLE]: {
      generatePass: generateGoogleWalletPass,
      imgSrc: `/images/illustrations/google-wallet.svg`,
      altText: 'Google Wallet',
      loadingMessage:
        'Generating your Google Wallet pass. This takes a few seconds.',
    },
  }

  const config = walletConfig[platform]

  const handleClick = async () => {
    const generate = async () => {
      const passUrl = await config.generatePass(lockAddress, network, tokenId)
      if (passUrl) {
        handlePassUrl(passUrl)
      }
    }

    await ToastHelper.promise(generate(), {
      loading: config.loadingMessage,
      success: 'Successfully generated!',
      error: `Failed to generate your ${config.altText} pass. Please try again.`,
    })
  }

  return (
    <Box as={as} {...rest} onClick={handleClick}>
      <Image width="16" height="16" alt={config.altText} src={config.imgSrc} />
      {!minimised && `Add to my ${config.altText}`}
    </Box>
  )
}
