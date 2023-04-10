import { Box, Modal, Size } from '@unlock-protocol/ui'
import QRCode from 'qrcode.react'
import { createWalletPass, Platform } from '../../../services/ethpass'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { config as AppConfig } from '~/config/app'

const addToPhoneWallet = async (
  signature: string,
  signatureMessage: string,
  signedByOwner: boolean,
  lockAddress: string,
  tokenId: string,
  network: number,
  image: string,
  platform: Platform,
  name: string
): Promise<string> => {
  const url = await createWalletPass({
    lockAddress,
    tokenId,
    network,
    signatureMessage,
    signature,
    signedByOwner,
    image,
    platform,
    name,
  })
  return url
}

interface ApplePassModalProps {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  applePassUrl?: string
}

/**
 * Apple needs a modal to show a QR code
 * @param param0
 * @returns
 */
export const ApplePassModal = ({
  isOpen,
  setIsOpen,
  applePassUrl,
}: ApplePassModalProps) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {applePassUrl && (
        <div className="flex flex-col items-center">
          <p>
            Please scan this device with your phone or{' '}
            <a href={applePassUrl} className="underline">
              click here to download it
            </a>
            .
          </p>
          <QRCode value={applePassUrl} size={256} includeMargin />
        </div>
      )}
      {!applePassUrl && <p>Generating your pass...</p>}
    </Modal>
  )
}

interface AddToWalletProps {
  children: React.ReactNode
  as: React.ElementType
  network: number
  lockAddress: string
  tokenId: string
  platform: Platform
  handlePassUrl: (url: string) => void
  disabled?: boolean
  active?: boolean
  name: string
  iconLeft?: JSX.Element
  size?: Size
  variant?: string
  className?: string
}

export const AddToDeviceWallet = ({
  children,
  as,
  lockAddress,
  tokenId,
  network,
  name,
  handlePassUrl,
  platform,
  ...rest
}: AddToWalletProps) => {
  const { getWalletService } = useAuth()
  const image = `${AppConfig.services.storage.host}/image/${network}/${lockAddress}/${tokenId}`
  const handleClick = async () => {
    const generate = async () => {
      // Handle if the user is not logged in
      const walletService = await getWalletService()
      const signatureMessage = `Sign this message to generate your mobile wallet ${new Date().getTime()} pass for ${lockAddress}}`
      const signature = await walletService.signMessage(
        signatureMessage,
        'personal_sign'
      )

      const passUrl = await addToPhoneWallet(
        signature,
        signatureMessage,
        true /** signedByOwner */,
        lockAddress,
        tokenId,
        network,
        image,
        platform,
        name
      )
      if (passUrl) {
        handlePassUrl(passUrl)
      }
    }

    await ToastHelper.promise(generate(), {
      loading: 'Generating a pass. This takes a few seconds.',
      success: 'Successfully generated!',
      error: `The pass could not generated. Please try again.`,
    })
  }

  return (
    <Box as={as} {...rest} onClick={handleClick}>
      {children}
    </Box>
  )
}
