import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectButton } from './Custom'
import { minifyAddress } from '@unlock-protocol/ui'
import { AiOutlineDisconnect as DisconnectIcon } from 'react-icons/ai'

export const ConnectedWallet = () => {
  const { account, deAuthenticate } = useAuth()
  return (
    <div className="grid divide-y divide-gray-100">
      <div className="flex flex-col items-center justify-center p-6">
        <div className="inline-flex text-lg font-bold">
          {minifyAddress(account!)}
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
