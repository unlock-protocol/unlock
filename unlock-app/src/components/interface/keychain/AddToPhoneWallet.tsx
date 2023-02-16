import { Modal } from '@unlock-protocol/ui'
import QRCode from 'qrcode.react'
import { DiAndroid as AndroidIcon, DiApple as AppleIcon } from 'react-icons/di'
import { createWalletPass, Platform } from '../../../services/ethpass'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { WalletService } from '@unlock-protocol/unlock-js'

// https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
function iOS() {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

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
  network: number
  lockAddress: string
  tokenId: string
  image: string
  setPassUrl?: (url: string) => void
  setShowApplePassModal?: (state: boolean) => void
}

export const AddToAppleWallet = ({
  lockAddress,
  tokenId,
  network,
  image,
  setPassUrl,
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
        Platform.APPLE
      )
      if (iOS()) {
        // Download
        window.open(passUrl, '_')
      } else if (setPassUrl) {
        // Show the modal
        setPassUrl(passUrl)
      }
    }

    await ToastHelper.promise(generate(), {
      loading: 'Generating a pass. This takes a few seconds.',
      success: 'Successfully generated!',
      error: `The pass could not generated. Please try again.`,
    })
  }

  return (
    <div className="flex" onClick={handleClick}>
      <AppleIcon />
      Add to my Apple device
    </div>
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
      loading: 'Generating a pass. This takes a few seconds.',
      success: 'Successfully generated!',
      error: `The pass could not generated. Please try again.`,
    })
  }

  return (
    <div className="flex" onClick={handleClick}>
      <AndroidIcon />
      Add to my Google device
    </div>
  )
}
