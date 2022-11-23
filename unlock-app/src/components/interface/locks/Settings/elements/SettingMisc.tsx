import { Lock } from '~/unlockTypes'
import { UpdateHooksForm } from '../forms/UpdateHooksForm'
import { SettingCard } from './SettingCard'

interface SettingMiscProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  lock?: Lock
}

export const SettingMisc = ({
  isManager,
  lockAddress,
  network,
  isLoading,
  lock,
}: SettingMiscProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Hooks"
        description={
          <span>
            {`Hooks are 3rd party contracts that can be called when your Lock
            itself is called. Whether it'd be for password protected purchase,
            or other use case. You can also learn more from our`}{' '}
            <a
              href=""
              target="_blank"
              rel="noreferrer"
              className="font-bold text-brand-ui-primary"
            >
              docs.
            </a>
          </span>
        }
        isLoading={isLoading}
      >
        <UpdateHooksForm
          lockAddress={lockAddress}
          isManager={isManager}
          disabled={!isManager}
          version={lock?.publicLockVersion}
        />
      </SettingCard>
    </div>
  )
}
