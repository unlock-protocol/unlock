import { CustomComponentProps } from '../UpdateHooksForm'
import { Select } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useUserGuilds } from '~/hooks/useUserGuilds'
import Link from 'next/link'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'

export const GuildContractHook = ({
  defaultValue,
  lockAddress,
  network,
}: CustomComponentProps) => {
  const [isSet, setIsSet] = useState(false)
  const { isLoading: isLoadingSettings, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })
  const [hookGuildId, setHookGuildId] = useState<string | null>(null)

  const { data: guilds, isLoading: isLoadingGuilds } = useUserGuilds()

  useEffect(() => {
    setHookGuildId(settings?.hookGuildId ?? null)
  }, [settings])

  useEffect(() => {
    setIsSet(false)
  }, [defaultValue])

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const onGuildSelected = async (guildId: string | number) => {
    await saveSettingsMutation({
      lockAddress,
      network,
      hookGuildId: guildId.toString(),
    })
    setHookGuildId(guildId.toString())
  }

  const guildsAsOptions =
    guilds?.map(({ id, name }) => ({
      label: name,
      value: id,
    })) ?? []

  const isLoading = isLoadingGuilds || isLoadingSettings

  return (
    <div className="flex flex-col gap-2">
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
          onChange={onGuildSelected}
          options={guildsAsOptions}
          defaultValue={hookGuildId}
          description={<p>Select a Guild for which you are an admin. </p>}
        />
      )}

      {isSet && (
        <span className="text-sm text-gray-600">
          {`Remember to press "Apply" at the end of the form to apply
                changes.`}
        </span>
      )}
    </div>
  )
}
