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
        label="Key Purchased Template"
        description={`Customize the content of the email sent when a new membership has been purchased. Emails are only sent if you selected the Collect Email option on the checkout.`}
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
        description={`Customize the content of the email sent when a new membership has been airdropped. Emails are only sent if you supplied them when you airdropped the memberships.`}
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
