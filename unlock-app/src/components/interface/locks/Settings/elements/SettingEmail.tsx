import { LockType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { SendEmailForm } from '../forms/SendEmailForm'
import { EmailTemplatePreview } from './EmailTemplatePreview'
import { SettingCard } from './SettingCard'
import { useMetadata } from '~/hooks/metadata'
import { SendCustomEmail } from '../forms/SendCustomEmail'

interface SettingEmailProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  publicLockVersion?: number
  publicLockLatestVersion?: number
}

interface TemplateProps {
  label: string
  description: string
  templateId: string
  customize?: boolean
}
const TemplateByLockType: Record<keyof LockType, TemplateProps[]> = {
  isEvent: [
    {
      label: 'Event key purchased',
      description:
        'Customize the content of the email sent when a event ticket is purchased. Emails are only sent if you selected the Collect Email option on the checkout.',
      templateId: 'eventKeyMined',
    },
    {
      label: 'Event key airdropped',
      description:
        'Customize the content of the email sent when an event ticket has been airdropped. Emails are only sent if you supplied them when you airdropped the memberships.',
      templateId: 'eventKeyAirdropped',
    },
  ],
  isCertification: [
    {
      label: 'Certificate key purchased',
      description:
        'Customize the content of the email sent when a certificate is purchased. Emails are only sent when email is present.',
      templateId: 'certificationKeyMined',
    },
    {
      label: 'Certificate key airdropped',
      description:
        'Customize the content of the email sent when a certificate is airdropped.',
      templateId: 'certificationKeyAirdropped',
    },
  ],
  isStamp: [],
}

const DEFAULT_EMAIL_TEMPLATES: TemplateProps[] = [
  {
    label: 'Key purchased template',
    description:
      'Customize the content of the email sent when a new membership has been purchased. Emails are only sent if you selected the Collect Email option on the checkout.',
    templateId: 'keyMined',
  },
  {
    label: 'Key airdropped template',
    description:
      'Customize the content of the email sent when a new membership has been airdropped. Emails are only sent if you supplied them when you airdropped the memberships.',
    templateId: 'keyAirdropped',
  },
]

export const SettingEmail = ({
  isManager,
  lockAddress,
  network,
  isLoading,
}: SettingEmailProps) => {
  const { isLoading: isLoadingMetadata, data: metadata } = useMetadata({
    lockAddress,
    network,
  })

  const types = getLockTypeByMetadata(metadata)

  // find lock type
  const [template] =
    Object.entries(types ?? {}).find(([, value]) => value === true) ?? []

  // template based on lockType
  const emailTemplates =
    TemplateByLockType[template as keyof LockType] || DEFAULT_EMAIL_TEMPLATES

  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Email Options"
        description={`Enable or disable emails sent by Unlock Labs for a lock and customize options.`}
        isLoading={isLoading}
      >
        <SendEmailForm
          disabled={!isManager}
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
        />
      </SettingCard>
      {emailTemplates?.map(({ label, description, templateId }) => {
        return (
          <SettingCard
            key={templateId}
            label={label}
            description={description}
            isLoading={isLoading || isLoadingMetadata}
          >
            <EmailTemplatePreview
              templateId={templateId}
              disabled={!isManager}
              lockAddress={lockAddress}
              network={network}
              isManager={isManager}
            />
          </SettingCard>
        )
      })}
      <SettingCard
        disabled={!isManager}
        label="Send Email"
        description="Send email to all members"
        isLoading={isLoading}
      >
        <SendCustomEmail lockAddress={lockAddress} network={network} />
      </SettingCard>
    </div>
  )
}
