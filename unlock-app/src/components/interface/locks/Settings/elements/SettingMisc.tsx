import { UpdateHooksForm } from '../forms/UpdateHooksForm'
import { UpdateVersionForm } from '../forms/UpdateVersionForm'
import { SettingCard } from './SettingCard'

interface SettingMiscProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  publicLockVersion?: number
  publicLockLatestVersion?: number
}

const UpgradeCard = ({ isLastVersion }: { isLastVersion: boolean }) => {
  if (isLastVersion) {
    return (
      <span className="text-base">You are running the latest version.</span>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-4 bg-gray-100 rounded-lg ">
      <span className="text-base font-bold text-brand-ui-primary">
        Upgrade Available 🔆
      </span>
      <span className="text-base text-brand-dark">
        This lock is deployed on an earlier version of the smart contract. An
        upgrade is available to the latest features.
      </span>
    </div>
  )
}

export const SettingMisc = ({
  isManager,
  lockAddress,
  network,
  isLoading,
  publicLockVersion,
  publicLockLatestVersion,
}: SettingMiscProps) => {
  const isLastVersion =
    publicLockVersion !== undefined &&
    publicLockLatestVersion !== undefined &&
    publicLockVersion === publicLockLatestVersion

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
          network={network}
          isManager={isManager}
          disabled={!isManager}
          version={publicLockVersion!}
        />
      </SettingCard>

      {(publicLockVersion ?? 0) >= 10 && (
        <SettingCard
          label="Versioning"
          description={<UpgradeCard isLastVersion={isLastVersion} />}
          isLoading={isLoading}
          disabled={isLastVersion}
        >
          <UpdateVersionForm
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            disabled={!isManager}
            version={publicLockVersion ?? 0}
            isLastVersion={isLastVersion}
          />
        </SettingCard>
      )}
    </div>
  )
}
