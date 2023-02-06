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
        label="Mint key template customization"
        description={`Customize email template.`}
        isLoading={isLoading}
      >
        <EmailTemplatePreview
          template="KEYMINED"
          header="<h1>A new Membership NFT in your wallet!</h1> <p>A new membership (#{keyId}) to the lock <strong>{lockName}</strong> was just minted for you!</p>"
          footer={`<p>It has been added to your <a href="{keychainUrl}">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>`}
          disabled={!isManager}
          lockAddress={lockAddress}
          network={network}
        />
      </SettingCard>
    </div>
  )
}
