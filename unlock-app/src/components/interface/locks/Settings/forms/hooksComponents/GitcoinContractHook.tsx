import { CustomComponentProps } from '../UpdateHooksForm'
import { Button, Input } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'

export const GitcoinContractHook = ({
  lockAddress,
  network,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const { data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const { handleSubmit, register, getValues, setValue } = useFormContext()

  // initialize the form field with the fetched setting
  useEffect(() => {
    if (settings?.requiredGitcoinPassportScore !== undefined) {
      setValue(
        'hook.requiredGitcoinPassportScore',
        settings.requiredGitcoinPassportScore
      )
    }
  }, [settings, setValue])

  const onSubmit = async (values: any) => {
    const requiredGitcoinPassportScore = getValues(
      'hook.requiredGitcoinPassportScore'
    ).toString()

    await saveSettingsMutation({
      lockAddress,
      network,
      requiredGitcoinPassportScore: requiredGitcoinPassportScore,
    })

    await setEventsHooksMutation.mutateAsync(values)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 text-sm"
    >
      <p>
        With this hook, you can control membership purchases exclusively for
        members with a required Gitcoin passport score.
      </p>

      <Input
        size="small"
        description="Required Gitcoin Passport Score"
        type="number"
        {...register('hook.requiredGitcoinPassportScore', {
          valueAsNumber: true,
          min: 15,
          max: 100,
          required: {
            value: true,
            message: 'This field is required',
          },
        })}
      />

      <div className="ml-auto">
        <Button
          loading={setEventsHooksMutation.isLoading}
          size="small"
          type="submit"
        >
          Save
        </Button>
      </div>
    </form>
  )
}
