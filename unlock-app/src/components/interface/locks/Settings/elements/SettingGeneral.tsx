import { Lock } from '@unlock-protocol/types'
import { UpdateBaseTokenURI } from '../forms/UpdateBaseTokenURI'
import { UpdateNameForm } from '../forms/UpdateNameForm'
import { UpdateSymbolForm } from '../forms/UpdateSymbolForm'
import { SettingCard } from './SettingCard'

interface SettingGeneralProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  lock?: Lock
}

export const SettingGeneral = ({
  isManager,
  lockAddress,
  network,
  isLoading,
  lock,
}: SettingGeneralProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Contract name"
        description="Customize the contract name on chain."
        isLoading={isLoading}
      >
        <UpdateNameForm
          lockAddress={lockAddress}
          isManager={isManager}
          disabled={!isManager}
          lockName={lock?.name ?? ''}
          network={network}
        />
      </SettingCard>

      <SettingCard
        label="Ticker Symbol"
        description="Default: KEY. Customize your membership experience by changing the token symbol (sometimes called 'ticker')."
        isLoading={isLoading}
      >
        <UpdateSymbolForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label="Base token URI"
        description="Update the base token URI of the lock that is used to create the individual token's URIs."
        isLoading={isLoading}
      >
        <UpdateBaseTokenURI
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
    </div>
  )
}
