import { Lock } from '@unlock-protocol/types'
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
        />
      </SettingCard>

      <SettingCard
        label="Ticker Symbol"
        description="Default: KEY. Customize your membership experience by change the token symbol, aka Ticker."
        isLoading={isLoading}
      >
        <UpdateSymbolForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
    </div>
  )
}
