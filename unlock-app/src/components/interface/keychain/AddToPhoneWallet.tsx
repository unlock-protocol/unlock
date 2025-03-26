import { Box } from '@unlock-protocol/ui'
import {
  generateAppleWalletPass,
  generateGoogleWalletPass,
  Platform,
} from '../../../services/passService'
import { ToastHelper } from '@unlock-protocol/ui'
import Image from 'next/image'

interface AddToWalletProps {
  platform: Platform
  as: React.ElementType
  network: number
  lockAddress: string
  tokenId: string
  handlePassUrl?: (url: string) => void
  disabled?: boolean
  active?: boolean
  iconLeft?: JSX.Element
  size?: 'small' | 'medium'
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
  size = 'medium',
  ...rest
}: AddToWalletProps) => {
  const walletConfig = {
    [Platform.APPLE]: {
      generatePass: generateAppleWalletPass,
      imgSrc: '/images/illustrations/apple-wallet.svg',
      altText: 'Apple Wallet',
      loadingMessage:
        'Generating your Apple Wallet pass. This takes a few seconds.',
    },
    [Platform.GOOGLE]: {
      generatePass: generateGoogleWalletPass,
      imgSrc: '/images/illustrations/google-wallet.svg',
      altText: 'Google Wallet',
      loadingMessage:
        'Generating your Google Wallet pass. This takes a few seconds.',
    },
  }

  const config = walletConfig[platform]

  const imageDimensions = {
    small: { width: 150, height: 12 },
    medium: { width: 200, height: 16 },
  } as const

  const handleClick = async () => {
    const generate = async () => {
      const passUrl = await config.generatePass(lockAddress, network, tokenId)
      if (platform === Platform.GOOGLE && handlePassUrl && passUrl) {
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
      <Image
        {...imageDimensions[size]}
        alt={config.altText}
        src={config.imgSrc}
      />
    </Box>
  )
}
