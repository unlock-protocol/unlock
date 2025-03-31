import { Button } from '@unlock-protocol/ui'
import { AddToPhoneWallet } from './AddToPhoneWallet'
import { isAndroid, isIOS } from 'react-device-detect'
import { Platform } from '~/services/passService'

interface AddToWallet {
  network: number
  lockAddress: string
  tokenId: string
  isCompact?: boolean
}

export const AddToWallet = ({
  network,
  lockAddress,
  tokenId,
  isCompact,
}: AddToWallet) => {
  return (
    <div className="w-full flex items-center justify-center px-4 py-1 gap-4">
      {!isIOS && (
        <AddToPhoneWallet
          className="bg-transparent px-0 py-0"
          platform={Platform.GOOGLE}
          size={isCompact ? 'small' : 'medium'}
          variant="secondary"
          as={Button}
          network={network}
          lockAddress={lockAddress}
          tokenId={tokenId}
          handlePassUrl={(url: string) => {
            window.location.assign(url)
          }}
        />
      )}
      {!isAndroid && (
        <AddToPhoneWallet
          className="bg-transparent px-0 py-0"
          platform={Platform.APPLE}
          size={isCompact ? 'small' : 'medium'}
          variant="secondary"
          as={Button}
          network={network}
          lockAddress={lockAddress}
          tokenId={tokenId}
        />
      )}
    </div>
  )
}
