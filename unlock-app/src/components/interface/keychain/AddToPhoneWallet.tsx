import { Box, Modal, Size } from '@unlock-protocol/ui'
import QRCode from 'qrcode.react'
import {
  generateAppleWalletPass,
  generateGoogleWalletPass,
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

// Add to Apple wallet
export const AddToAppleWallet = ({
  as,
  lockAddress,
  tokenId,
  network,
  handlePassUrl,
  minimised,
  ...rest
}: AddToWalletProps) => {
  const handleClick = async () => {
    const generate = async () => {
      const passUrl = await generateAppleWalletPass(
        lockAddress,
        network,
        tokenId
      )
      if (passUrl) {
        handlePassUrl(passUrl)
      }
    }

    await ToastHelper.promise(generate(), {
      loading: 'Generating your Apple Wallet pass. This takes a few seconds.',
      success: 'Successfully generated!',
      error: 'Failed to generate your Apple Wallet pass. Please try again.',
    })
  }

  return (
    <Box as={as} {...rest} onClick={handleClick}>
      <Image
        width="16"
        height="16"
        alt="Google Wallet"
        src={`/images/illustrations/apple-wallet.svg`}
      />
      {!minimised && 'Add to my Apple Wallet'}
    </Box>
  )
}

// Add to Google wallet
export const AddToGoogleWallet = ({
  as,
  lockAddress,
  tokenId,
  network,
  handlePassUrl,
  minimised,
  ...rest
}: AddToWalletProps) => {
  const handleClick = async () => {
    const generate = async () => {
      const passUrl = await generateGoogleWalletPass(
        lockAddress,
        network,
        tokenId
      )
      if (passUrl) {
        handlePassUrl(passUrl)
      }
    }

    await ToastHelper.promise(generate(), {
      loading: 'Generating your Google Wallet pass. This takes a few seconds.',
      success: 'Successfully generated!',
      error: 'Failed to generate your Google Wallet pass. Please try again.',
    })
  }

  return (
    <Box as={as} {...rest} onClick={handleClick}>
      <Image
        width="16"
        height="16"
        alt="Google Wallet"
        src={`/images/illustrations/google-wallet.svg`}
      />
      {!minimised && 'Add to my Google Wallet'}
    </Box>
  )
}
