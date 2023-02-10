import { EmailTemplatePreview } from './EmailTemplatePreview'
import { SettingCard } from './SettingCard'

interface SettingEmailProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  publicLockVersion?: number
  publicLockLatestVersion?: number
}

export const SettingEmail = ({
  isManager,
  lockAddress,
  network,
  isLoading,
}: SettingEmailProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Key Minted Template"
        description={`Add custom content to the email sent when a key is minted.`}
        isLoading={isLoading}
      >
        <EmailTemplatePreview
          templateId="keyMined"
          disabled={!isManager}
          lockAddress={lockAddress}
          network={network}
        />
      </SettingCard>

      <SettingCard
        label="Key Airdropped Template"
        description={`Add custom content to the email sent when a key is airdropped.`}
        isLoading={isLoading}
      >
        <EmailTemplatePreview
          templateId="keyAirdropped"
          disabled={!isManager}
          lockAddress={lockAddress}
          network={network}
        />
      </SettingCard>
    </div>
  )
}
