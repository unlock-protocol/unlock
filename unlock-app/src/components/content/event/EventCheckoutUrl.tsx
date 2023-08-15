import { Button, Placeholder, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { Controller, useForm } from 'react-hook-form'
import { useCheckoutConfigsByUser } from '~/hooks/useCheckoutConfig'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'
import { storage } from '~/config/storage'
import Link from 'next/link'
import { useMetadata } from '~/hooks/metadata'
import { useRouter } from 'next/router'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useEffect, useState } from 'react'

interface EventCheckoutUrlProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  onCheckoutChange: () => void
}

interface FormProps {
  slug?: string
  checkoutConfigId?: string | null
}

export const EventCheckoutUrl = ({
  lockAddress,
  network,
  disabled,
  isManager,
  onCheckoutChange,
}: EventCheckoutUrlProps) => {
  const router = useRouter()
  const [useCheckoutURL, setUseCheckoutURL] = useState(false)
  const { isLoading: isLoadingConfigList, data: checkoutConfigList } =
    useCheckoutConfigsByUser()

  const saveSettingsMutation = useSaveLockSettings()
  const { data: metadata } = useMetadata({ lockAddress, network })

  const { isLoading: isLoadingSettings, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })

  const checkoutUrl = `/locks/checkout-url?lock=${lockAddress}&network=${network}`

  const hasCustomUrl = !!settings?.slug
  const hasConfigList = !!checkoutConfigList?.length

  const methods = useForm<FormProps>({
    mode: 'onChange',
  })

  // enable toggle if setting is present
  useEffect(() => {
    if (!settings?.checkoutConfigId) return
    setUseCheckoutURL(true)
  }, [settings])

  const loading = isLoadingConfigList || isLoadingSettings

  const {
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = methods

  const checkoutConfigId = watch('checkoutConfigId')

  const onSubmit = async ({ slug, checkoutConfigId }: FormProps) => {
    // add custom URL as part of the metadata
    if (!hasCustomUrl) {
      await storage.updateLockMetadata(network, lockAddress, {
        metadata: {
          ...metadata,
          slug,
        },
      })
    }
    const saveSettingPromise = saveSettingsMutation.mutateAsync({
      lockAddress,
      network,
      slug,
      checkoutConfigId,
    })

    // save settings with slug + Checkout id
    await ToastHelper.promise(saveSettingPromise, {
      success: 'Configuration saved.',
      error: 'There is an issue with configuration update.',
      loading: 'Saving configuration...',
    })

    await onCheckoutChange()

    if (!hasCustomUrl) {
      router.push(`event?s=${slug}`)
    }
  }

  const configOptions =
    checkoutConfigList?.map(({ name: label, id: value }) => {
      return {
        label,
        value,
      }
    }) ?? []

  if (loading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Line />
      </Placeholder.Root>
    )
  }

  if (!hasConfigList) {
    return (
      <span>
        No items to choose from.{' '}
        <Link
          className="font-semibold text-brand-ui-primary"
          href={checkoutUrl}
          rel="noopener noreferrer"
        >
          Create a new checkout URL, where you can configure the checkout steps
          for your event.
        </Link>{' '}
        first.
      </span>
    )
  }

  return (
    <div>
      <form className="grid gap-4" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="w-full">
          <ToggleSwitch
            title="Set a custom checkout URL"
            enabled={useCheckoutURL}
            size="small"
            setEnabled={(enabled) => {
              if (!enabled) {
                setValue('checkoutConfigId', null, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              setUseCheckoutURL(enabled)
            }}
          />
          {useCheckoutURL && (
            <>
              <Controller
                name="checkoutConfigId"
                control={control}
                rules={{
                  required: {
                    value: useCheckoutURL,
                    message: 'This field is required.',
                  },
                }}
                render={() => {
                  return (
                    <>
                      <Select
                        options={configOptions}
                        defaultValue={
                          settings?.checkoutConfigId || checkoutConfigId
                        }
                        description={
                          <span>
                            Missing checkout URL? You can{' '}
                            <Link
                              className="font-semibold text-brand-ui-primary"
                              href={checkoutUrl}
                              rel="noopener noreferrer"
                            >
                              create a new one
                            </Link>{' '}
                            .
                          </span>
                        }
                        onChange={(checkoutConfigId: string | number) => {
                          setValue('checkoutConfigId', `${checkoutConfigId}`, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }}
                      />
                    </>
                  )
                }}
              />
              {errors?.checkoutConfigId?.message && (
                <span className="text-sm text-red-500">
                  {errors?.checkoutConfigId?.message}
                </span>
              )}
            </>
          )}
        </div>
        {isManager && (
          <Button disabled={!isDirty || disabled} className="w-full md:w-1/3">
            Apply
          </Button>
        )}
      </form>
    </div>
  )
}
