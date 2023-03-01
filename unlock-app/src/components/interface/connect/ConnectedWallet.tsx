import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectButton } from './Custom'
import { minifyAddress } from '@unlock-protocol/ui'
import { AiOutlineDisconnect as DisconnectIcon } from 'react-icons/ai'
import useClipboard from 'react-use-clipboard'
import { IoCopyOutline as CopyIcon } from 'react-icons/io5'

export const ConnectedWallet = () => {
  const { account, deAuthenticate } = useAuth()
  const [isCopied, copy] = useClipboard(account || '', {
    successDuration: 1000,
  })
  return (
    <div className="grid divide-y divide-gray-100">
      <div className="flex flex-col items-center justify-center p-6">
        <div className="inline-flex items-center gap-2 text-lg font-bold">
          {minifyAddress(account!)}
          <button
            className="inline-flex items-center gap-2 text-sm font-medium hover:bg-gray-100 bg-gray-50 px-2 py-0.5 rounded"
            onClick={(event) => {
              event.preventDefault()
              copy()
            }}
          >
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
            <CopyIcon />
          </button>
        </div>
      </div>
      <div className="grid p-6">
        <ConnectButton
          onClick={(event) => {
            event.preventDefault()
            deAuthenticate()
          }}
          icon={<DisconnectIcon size={24} />}
        >
          Disconnect
        </ConnectButton>
      </div>
    </div>
  )
}
