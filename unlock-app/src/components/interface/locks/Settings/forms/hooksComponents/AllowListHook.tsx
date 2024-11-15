import { CustomComponentProps } from '../UpdateHooksForm'
import { Button, Input, TextBox } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'

export const AllowListHook = ({
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
    if (settings?.allowList !== undefined) {
      setValue('hook.allowList', settings.allowList)
    }
  }, [settings, setValue])

  const onSubmit = async (values: any) => {
    const allowList = getValues('hook.allowList').toString()

    await saveSettingsMutation({
      lockAddress,
      network,
      allowList,
    })

    await setEventsHooksMutation.mutateAsync(values)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 text-sm"
    >
      <p>
        With this hook, you can set an allow-list of addresses that are approved
        to mint memberships from your contract. Other addresses will be
        rejected.
      </p>

      <TextBox
        label={'Allow List'}
        size={'small'}
        value={''}
        description={'Please, enter one single address per line.'}
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
