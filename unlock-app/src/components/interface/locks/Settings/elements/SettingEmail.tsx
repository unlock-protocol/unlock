import { LockType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { SendEmailForm } from '../forms/SendEmailForm'
import { EmailTemplatePreview } from './EmailTemplatePreview'
import { SettingCard } from './SettingCard'
import { useMetadata } from '~/hooks/metadata'
import { SendCustomEmail } from '../forms/SendCustomEmail'
import { useGetLockSettings } from '~/hooks/useLockSettings'

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
      label: 'Purchase confirmation template',
      description:
        'Customize the content of the email sent when a event ticket is purchased. ',
      templateId: 'eventKeyMined',
    },
    {
      label: 'Airdrop confirmation template',
      description:
        'Customize the content of the email sent when an event ticket has been airdropped. ',
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
    label: 'Purchase confirmation template',
    description:
      'Customize the content of the email sent when a new membership has been purchased. Emails are only sent if you selected the Collect Email option on the checkout.',
    templateId: 'keyMined',
  },
  {
    label: 'Airdrop confirmation template',
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

  const { data: { replyTo, emailSender } = {} } = useGetLockSettings({
    network,
    lockAddress,
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
        label="Send Emails"
        description={`Enable or disable emails sent by Unlock Labs, and set the sender details.`}
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
              sendingParams={{ replyTo, emailSender }}
            />
          </SettingCard>
        )
      })}
      <SettingCard
        disabled={!isManager}
        label="Send a custom email now"
        description="Send an email to all token holders"
        isLoading={isLoading}
      >
        <SendCustomEmail lockAddress={lockAddress} network={network} />
      </SettingCard>
    </div>
  )
}
