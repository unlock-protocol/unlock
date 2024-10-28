'use client'

import { Button, Modal, Tabs } from '@unlock-protocol/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckoutConfig, PaywallConfigType } from '@unlock-protocol/core'
import {
  CheckoutPreview,
  CheckoutShareOrDownload,
} from './elements/CheckoutPreview'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import {
  useCheckoutConfigRemove,
  useCheckoutConfigUpdate,
  useCheckoutConfigsByUser,
} from '~/hooks/useCheckoutConfig'
import { FaTrash as TrashIcon } from 'react-icons/fa'
import { useMutation } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { BasicConfigForm } from './elements/BasicConfigForm'
import { LocksForm } from './elements/LocksForm'
import { ChooseConfiguration } from './ChooseConfiguration'
import { FormProvider, useForm } from 'react-hook-form'
import { useDebounce } from 'react-use'
import { getCheckoutUrl } from '~/components/content/event/utils'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export type Configuration = 'new' | 'existing'
interface ConfigurationFormProps {
  configName: string
}

const Header = () => {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Checkout Builder</h1>
      <span className="text-base text-gray-700">
        Customize your membership checkout experience. The preview on the left
        is updated in realtime.
      </span>
    </header>
  )
}

export const CheckoutUrlContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { account } = useAuthenticate()
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [isDeleteConfirmation, setDeleteConfirmation] = useState(false)
  const [configuration, setConfiguration] = useState<Configuration>('new')
  const methods = useForm<ConfigurationFormProps>({
    mode: 'onChange',
    defaultValues: {
      configName: '',
    },
  })

  const { control, trigger, watch, setValue } = methods

  const DEFAULT_CONFIG = useMemo(
    () => ({
      id: null,
      config: {
        locks: {},
        referrer: account,
        icon: '',
      },
    }),
    [account]
  ) as CheckoutConfig

  const [checkoutConfig, setCheckoutConfig] = useState(DEFAULT_CONFIG)

  const {
    isLoading: isLoadingConfigList,
    data: checkoutConfigList,
    refetch: refetchConfigList,
  } = useCheckoutConfigsByUser()

  const { mutateAsync: updateConfig, isPending: isConfigUpdating } =
    useCheckoutConfigUpdate()

  const { mutateAsync: removeConfig, isPending: isConfigRemoving } =
    useCheckoutConfigRemove()

  useEffect(() => {
    if ((checkoutConfigList?.length ?? 0) > 0) {
      setConfiguration('existing')
    }
  }, [checkoutConfigList?.length])

  useEffect(() => {
    setCheckoutUrl(getCheckoutUrl(checkoutConfig))
  }, [checkoutConfig, setCheckoutUrl])

  const onConfigRemove = useCallback(async () => {
    if (!checkoutConfig.id) {
      setDeleteConfirmation(false)
      return
    }
    await removeConfig(checkoutConfig.id)
    const { data: list } = await refetchConfigList()
    const result = list?.[0]
    setCheckoutConfig({
      id: result?.id || null,
      name: result?.name || 'config',
      config: (result?.config as PaywallConfigType) || DEFAULT_CONFIG,
    })
    setDeleteConfirmation(false)
  }, [checkoutConfig, removeConfig, refetchConfigList, setDeleteConfirmation])

  const onAddLocks = async (locks: any) => {
    setCheckoutConfig((state) => {
      return {
        ...state,
        config: {
          ...state.config,
          locks,
        },
      }
    })
  }

  const onBasicConfigChange = async (fields: Partial<PaywallConfigType>) => {
    const { locks, ...rest } = fields

    setCheckoutConfig((state) => {
      return {
        ...state,
        config: {
          ...state.config,
          ...rest,
        },
      }
    })
  }

  const TopBar = () => {
    return (
      <div className="flex justify-start">
        <Button variant="borderless" aria-label="arrow back">
          <ArrowBackIcon
            size={20}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
        </Button>
      </div>
    )
  }

  const configName = watch('configName')

  const handleSetConfiguration = useCallback(
    async ({ config, ...rest }: CheckoutConfig) => {
      const option = {
        ...rest,
        config: config || DEFAULT_CONFIG,
      }

      setCheckoutConfig(option)

      if (!option.id) {
        try {
          const response = await updateConfig(option)

          setCheckoutConfig({
            id: response.id!,
            config: response.config as PaywallConfigType,
            name: response.name,
          })
          setValue('configName', '') // reset field after new configuration is set
          await refetchConfigList()
        } catch (error) {
          // Pass error to the form to block skip to next step
          console.error("Couldn't create new configuration: ", error)
          throw error
        }
      }
    },
    [DEFAULT_CONFIG, refetchConfigList, setValue, updateConfig]
  )

  useEffect(() => {
    if (checkoutConfigList?.length && !!searchParams.get('id')) {
      const config = checkoutConfigList.find(
        (c) => c.id === searchParams.get('id')
      )
      if (config) {
        // @ts-expect-error something
        handleSetConfiguration(config)
      } else {
        // TODO: handle the case where the user is a lock manager but the config was not created by them
      }
    }
  }, [checkoutConfigList, searchParams, handleSetConfiguration])

  const handleSetConfigurationMutation = useMutation({
    mutationFn: handleSetConfiguration,
  })

  const isNewConfiguration = configuration === 'new'

  const onSubmitConfiguration = async () => {
    const isValid = await trigger()
    if (!isValid) return Promise.reject() // pass rejected promise to block skip to next step

    if (isNewConfiguration) {
      try {
        // this is a new config, let's pass an empty config
        await handleSetConfiguration({
          id: null,
          name: configName,
          config: DEFAULT_CONFIG.config,
        })
      } catch (error) {
        ToastHelper.error('A configuration with that name already exists.')
        return Promise.reject()
      }
    } else {
      if (!checkoutConfig?.id) {
        ToastHelper.error('Please select a configuration or create a new one.')
        return Promise.reject() // no config selected, prevent skip to next step
      }
    }
  }

  const submitConfigurationMutation = useMutation({
    mutationFn: onSubmitConfiguration,
  })
  const deleteConfigurationMutation = useMutation({
    mutationFn: onConfigRemove,
  })

  const hasSelectedConfig =
    configuration === 'existing' && checkoutConfig?.id !== undefined

  /**
   * Save checkout config when fields have changed, This is done with delays invoking a function until after wait milliseconds have passed
   * to avoid calling the endpoint multiple times.
   */
  const [_isReady] = useDebounce(
    async () => {
      if (!checkoutConfig?.id) return // prevent save if not config is set
      await updateConfig({
        config: checkoutConfig.config,
        name: checkoutConfig.name,
        id: checkoutConfig.id,
      })
    },
    2000, // 2 seconds of delay after edits to trigger auto-save
    [checkoutConfig, updateConfig, refetchConfigList]
  )
  const loading =
    isLoadingConfigList || handleSetConfigurationMutation.isPending

  return (
    <>
      <Modal isOpen={isDeleteConfirmation} setIsOpen={setDeleteConfirmation}>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Delete {checkoutConfig.name}</h1>
          <span className="text-base text-gray-700">
            Are you sure you want to delete this checkout configuration? This
            will break any links that use this configuration and cannot be
            undone.
          </span>
          <div className="grid w-full">
            <Button
              loading={isConfigRemoving}
              iconLeft={<TrashIcon />}
              onClick={() => {
                deleteConfigurationMutation.mutateAsync()
              }}
            >
              Delete {checkoutConfig.name}
            </Button>
          </div>
        </div>
      </Modal>
      <TopBar />
      <div className="z-[1] flex flex-col w-full min-h-screen gap-8 pb-20 md:flex-row relative">
        <div className="z-0 order-2 md:w-1/2 md:order-1">
          <CheckoutPreview
            id={checkoutConfig.id}
            paywallConfig={checkoutConfig.config}
            checkoutUrl={checkoutUrl}
          />
        </div>
        <div className="z-0 flex flex-col order-1 gap-5 md:gap-10 md:w-1/2 md:order-2">
          <Header />
          <FormProvider {...methods}>
            <Tabs
              tabs={[
                {
                  title: 'Choose a configuration',
                  description:
                    'Create a new configuration or continue enhance the existing one for your checkout modal',
                  children: (
                    <div className="flex items-center w-full gap-4 p-2">
                      <div className="w-full">
                        <ChooseConfiguration
                          loading={
                            isLoadingConfigList ||
                            submitConfigurationMutation.isPending ||
                            deleteConfigurationMutation.isPending
                          }
                          name="configName"
                          control={control}
                          disabled={isConfigUpdating}
                          items={
                            (checkoutConfigList as unknown as CheckoutConfig[]) ||
                            ([] as CheckoutConfig[])
                          }
                          onChange={async ({ config, ...rest }) =>
                            await handleSetConfigurationMutation.mutateAsync({
                              config,
                              ...rest,
                            })
                          }
                          setConfiguration={setConfiguration}
                          configuration={configuration}
                          value={checkoutConfig}
                        />
                      </div>
                    </div>
                  ),
                  onNext: async () =>
                    await submitConfigurationMutation.mutateAsync(),
                },
                {
                  title: 'Configure the basics',
                  description:
                    'Customize the checkout modal interaction & additional behavior',
                  disabled: !hasSelectedConfig,
                  loading,
                  children: (
                    <BasicConfigForm
                      onChange={onBasicConfigChange}
                      defaultValues={checkoutConfig.config}
                    />
                  ),
                },
                {
                  title: 'Configured locks',
                  description:
                    'Select the locks that you would like to featured in this configured checkout modal',
                  disabled: !hasSelectedConfig,
                  loading,
                  children: (
                    <LocksForm
                      onChange={onAddLocks}
                      locks={checkoutConfig.config?.locks}
                    />
                  ),
                  button: {},
                },
                {
                  title:
                    'Share the checkout link or download the configuration',
                  description:
                    'Copy the checkout URL to share, or download a JSON file for your implementation',
                  children: (
                    <CheckoutShareOrDownload
                      paywallConfig={checkoutConfig.config}
                      checkoutUrl={checkoutUrl}
                      size="medium"
                      id={checkoutConfig.id}
                    />
                  ),
                  showButton: false,
                  disabled: !hasSelectedConfig,
                },
              ]}
            />
          </FormProvider>
        </div>
      </div>
    </>
  )
}
