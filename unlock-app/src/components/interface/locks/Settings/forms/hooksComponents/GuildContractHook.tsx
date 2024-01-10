import { CustomComponentProps } from '../UpdateHooksForm'
import { Button, Select } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useUserGuilds } from '~/hooks/useUserGuilds'
import Link from 'next/link'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'
import { useFormContext } from 'react-hook-form'

export const GuildContractHook = ({
  lockAddress,
  network,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const { handleSubmit } = useFormContext()

  const { isLoading: isLoadingSettings, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })
  const [hookGuildId, setHookGuildId] = useState<string | null>(null)

  const { data: guilds, isLoading: isLoadingGuilds } = useUserGuilds()

  useEffect(() => {
    setHookGuildId(settings?.hookGuildId ?? null)
  }, [settings])

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const guildsAsOptions =
    guilds?.map(({ id, name }) => ({
      label: name,
      value: id,
    })) ?? []

  const isLoading = isLoadingGuilds || isLoadingSettings

  const onSubmit = async (values: any) => {
    await saveSettingsMutation({
      lockAddress,
      network,
      hookGuildId,
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
        members belonging to a{' '}
        <Link
          className=" text-brand-ui-primary underline"
          target="_blank"
          href="https://guild.xyz/"
        >
          Guild.xyz
        </Link>{' '}
        guild.
      </p>
      {isLoading && <span>Loading...</span>}
      {!isLoading && (
        <Select
          size="small"
          onChange={(value) => setHookGuildId(value.toString())}
          options={guildsAsOptions}
          defaultValue={hookGuildId}
          description={<p>Select a Guild for which you are an admin. </p>}
        />
      )}
      <div className="ml-auto">
        <Button
          size="small"
          type="submit"
          loading={setEventsHooksMutation.isLoading}
        >
          Save
        </Button>
      </div>
    </form>
  )
}
