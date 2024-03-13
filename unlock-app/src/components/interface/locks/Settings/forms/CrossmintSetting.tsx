import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'

interface CrossmintSettingsFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

export const CrossmintSettingsForm = ({
  lockAddress,
  network,
  isManager,
}: CrossmintSettingsFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm()

  const { isLoading: isLoadingSettings, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })
  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const onSubmit = (values: any) => {
    return saveSettingsMutation({
      lockAddress,
      network,
      crossmintClientId: [
        values.crossmintCollectionId,
        values.crossmintProjectId,
      ].join('/'),
    })
  }

  useEffect(() => {
    if (settings?.crossmintClientId) {
      const [collectionId, projectId] = settings.crossmintClientId.split('/')
      setValue('crossmintProjectId', projectId)
      setValue('crossmintCollectionId', collectionId)
    }
  }, [settings?.crossmintClientId, setValue])

  if (isLoadingSettings) {
    return (
      <Placeholder.Root className="grid grid-cols-1 gap-4">
        <Placeholder.Line size="xl" />
        <Placeholder.Line size="xl" />
      </Placeholder.Root>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        className="grid grid-cols-1 gap-2 text-left"
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="">
          Follow{' '}
          <Link
            className="underline"
            target="_blank"
            href="https://unlock-protocol.com/guides/crossmint-credit-card-unlock/"
          >
            this guide on how to set Crossmint
          </Link>{' '}
          up and copy the following values from the Crossmint console.
        </p>
        <div className="w-full md:w-1/2">
          <Input label="Project ID:" {...register('crossmintProjectId')} />
        </div>
        <div className="w-full md:w-1/2">
          <Input
            label="Collection ID:"
            {...register('crossmintCollectionId')}
          />
        </div>
        {isManager && (
          <Button
            loading={isSubmitting}
            disabled={isSubmitting}
            type="submit"
            className="w-full md:w-1/3"
          >
            Save
          </Button>
        )}
      </form>
    </div>
  )
}
