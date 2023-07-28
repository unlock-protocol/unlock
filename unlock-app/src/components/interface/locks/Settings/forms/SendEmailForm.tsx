import { storage } from '~/config/storage'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Placeholder, ToggleSwitch } from '@unlock-protocol/ui'
import { useState } from 'react'
import { EmailSettingsForm } from './EmailSettingsForm'
import { useSaveLockSettings } from '~/hooks/useLockSettings'

interface SubscriptionFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

export const SendEmailForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: SubscriptionFormProps) => {
  const [sendEmail, setSendEmail] = useState(true)
  const [changed, setChanged] = useState(false)
  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const updateRequireEmail = async () => {
    if (!isManager) return
    return await saveSettingsMutation({
      lockAddress,
      network,
      sendEmail,
    })
  }

  const updateSettingsMutation = useMutation(updateRequireEmail, {
    onSuccess: () => {
      setChanged(false)
    },
  })

  const { isLoading, data: { data: lockSettings } = {} } = useQuery(
    ['getLockSettings', lockAddress, network, updateSettingsMutation.isSuccess],
    async () => await storage.getLockSettings(network, lockAddress),
    {
      enabled: lockAddress?.length > 0 && !!network && isManager,
      onSuccess: (res: any) => {
        setSendEmail(res?.data?.sendEmail ?? true)
      },
    }
  )
  const sendEmailValue = lockSettings?.sendEmail
  const disabledInput = disabled || isLoading || !isManager

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Card size="lg" />
      </Placeholder.Root>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ToggleSwitch
        title="Send email"
        disabled={disabledInput}
        enabled={sendEmail}
        description={
          <span className="mt-2 text-base font-semibold text-black">
            {!sendEmailValue
              ? 'Emails are disabled, Unlock Labs will not send emails to users.'
              : 'Emails are enabled, Unlock Labs will send emails to user when their membership status changes.'}
          </span>
        }
        setEnabled={(enabled: boolean) => {
          setSendEmail(enabled)
          setChanged(true)
        }}
      />
      {isManager && (
        <Button
          loading={updateSettingsMutation.isLoading}
          onClick={() => {
            updateSettingsMutation.mutateAsync()
          }}
          disabled={disabledInput || !changed || !isManager}
          className="w-full md:w-1/3"
        >
          Apply
        </Button>
      )}
      {sendEmail && (
        <div className="w-full p-4 border border-gray-500 rounded-lg">
          <EmailSettingsForm
            lockAddress={lockAddress}
            isManager={isManager}
            network={network}
            disabled={disabled || !sendEmailValue}
            lockSettings={lockSettings}
          />
        </div>
      )}
    </div>
  )
}
