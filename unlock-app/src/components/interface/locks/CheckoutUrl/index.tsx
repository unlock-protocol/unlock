import { Button, Modal, Tabs } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PaywallConfigType } from '@unlock-protocol/core'
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
import { useLockSettings } from '~/hooks/useLockSettings'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { BasicConfigForm } from './elements/BasicConfigForm'
import { LocksForm } from './elements/LocksForm'
import { ChooseConfiguration, CheckoutConfig } from './ChooseConfiguration'
import { FormProvider, useForm } from 'react-hook-form'
import { useDebounce } from 'react-use'

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

export const CheckoutUrlPage = () => {
  const router = useRouter()
  const query = router.query
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const { lock: lockAddress, network } = query ?? {}
  const [isDeleteConfirmation, setDeleteConfirmation] = useState(false)
  const { getIsRecurringPossible } = useLockSettings()
  const [configuration, setConfiguration] = useState<Configuration>('new')
  const methods = useForm<ConfigurationFormProps>({
    mode: 'onChange',
    defaultValues: {
      configName: '',
    },
  })

  const { control, trigger, watch, setValue } = methods

  const {
    isPlaceholderData: isRecurringSettingPlaceholder,
    data: recurringSetting,
  } = useQuery(
    ['isRecurringPossible', network, lockAddress],
    async () => {
      return getIsRecurringPossible({
        lockAddress: lockAddress!.toString(),
        network: Number(network!),
      })
    },
    {
      placeholderData: {
        isRecurringPossible: false,
        oneYearRecurring: 0,
        gasRefund: 0,
      },
      enabled: Boolean(network && lockAddress),
    }
  )

  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig>({
    id: null as null | string,
    name: 'config',
    config: {
      locks:
        network && lockAddress
          ? {
              [lockAddress as string]: {
                network: parseInt(`${network!}`),
                skipRecipient: true,
              },
            }
          : {},
      icon: '',
      pessimistic: true,
      skipRecipient: true,
    },
  })

  const DEFAULT_CONFIG = useMemo(() => {
    const recurringPayments = recurringSetting?.isRecurringPossible
      ? recurringSetting.oneYearRecurring
      : undefined
    return {
      locks:
        network && lockAddress
          ? {
              [lockAddress as string]: {
                network: parseInt(`${network!}`),
                skipRecipient: true,
                recurringPayments,
              },
            }
          : {},
      icon: '',
      pessimistic: true,
      skipRecipient: true,
    } as PaywallConfigType
  }, [recurringSetting, lockAddress, network])

  const {
    isLoading: isLoadingConfigList,
    data: checkoutConfigList,
    refetch: refetchConfigList,
  } = useCheckoutConfigsByUser()

  const { mutateAsync: updateConfig, isLoading: isConfigUpdating } =
    useCheckoutConfigUpdate()

  const { mutateAsync: removeConfig, isLoading: isConfigRemoving } =
    useCheckoutConfigRemove()

  // retrieve recurringPayments when lock is present in url
  useEffect(() => {
    if (
      (!lockAddress && !network) ||
      isRecurringSettingPlaceholder ||
      isLoadingConfigList ||
      (checkoutConfigList || [])?.length > 0
    )
      return
    const getDefaultConfig = async (): Promise<void> => {
      const recurringPayments = recurringSetting?.isRecurringPossible
        ? recurringSetting.oneYearRecurring
        : undefined

      setCheckoutConfig((state) => {
        if (state.config.locks[lockAddress as string]) {
          // set recurring value
          state.config.locks[lockAddress as string].recurringPayments =
            recurringPayments
        }

        return {
          ...state,
          config: {
            ...state.config,
          },
        }
      })
    }
    getDefaultConfig()
  }, [
    lockAddress,
    network,
    isRecurringSettingPlaceholder,
    recurringSetting,
    isLoadingConfigList,
    checkoutConfigList,
  ])

  useEffect(() => {
    if ((checkoutConfigList?.length ?? 0) > 0) {
      setConfiguration('existing')
    }
  }, [checkoutConfigList?.length])

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
  }, [
    checkoutConfig,
    removeConfig,
    refetchConfigList,
    DEFAULT_CONFIG,
    setDeleteConfirmation,
  ])

  useEffect(() => {
    const checkout = checkoutConfigList?.[0]
    if (!checkout) return

    setCheckoutConfig({
      id: checkout.id,
      name: checkout.name,
      config: checkout.config as PaywallConfigType,
    })
  }, [checkoutConfigList])

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
    const hasDefaultLock =
      Object.keys(fields?.locks ?? {}).length === 0 && lockAddress && network

    const { locks, ...rest } = fields

    if (hasDefaultLock) {
      fields = {
        ...rest,
        locks: {
          ...locks,
          [lockAddress as string]: {
            network: parseInt(`${network!}`),
          },
        },
      }
    }

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
      <Button variant="borderless" aria-label="arrow back">
        <ArrowBackIcon
          size={20}
          className="cursor-pointer"
          onClick={() => router.back()}
        />
      </Button>
    )
  }

  const configName = watch('configName')

  const handleSetConfiguration = async ({
    config,
    ...rest
  }: CheckoutConfig) => {
    const option = {
      ...rest,
      config: config || DEFAULT_CONFIG,
    }
    setCheckoutConfig(option)
    if (!option.id) {
      const response = await updateConfig(option)
      setCheckoutConfig({
        id: response.id,
        config: response.config as PaywallConfigType,
        name: response.name,
      })
      setValue('configName', '') // reset field after new configuration is set
      await refetchConfigList()
    }
  }

  const handleSetConfigurationMutation = useMutation(handleSetConfiguration)

  const isNewConfiguration = configuration === 'new'

  const onSubmitConfiguration = async () => {
    const isValid = await trigger()
    if (!isValid) return Promise.reject() // pass rejected promise to block skip to next step

    if (isNewConfiguration) {
      // this is a new config, let's pass an empty config
      await handleSetConfiguration({
        id: null,
        name: configName,
        config: DEFAULT_CONFIG,
      })
    }

    if (!checkoutConfig?.id) {
      ToastHelper.error('Please select a configuration or create a new one.')
      return Promise.reject() // no config selected, prevent skip to next step
    }
  }

  const submitConfigurationMutation = useMutation(onSubmitConfiguration)
  const deleteConfigurationMutation = useMutation(onConfigRemove)

  const hasRecurringPlaceholder =
    !!lockAddress && !!network && isRecurringSettingPlaceholder

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
    2000, // 2 seconds of delay after edit's to trigger auto-save
    [checkoutConfig, updateConfig, refetchConfigList]
  )
  const loading =
    isLoadingConfigList || handleSetConfigurationMutation.isLoading

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
      <div className="z-[1] flex flex-col w-full min-h-screen gap-8 pt-10 pb-20 md:flex-row relative">
        <div className="z-0 order-2 md:w-1/2 md:order-1">
          <CheckoutPreview
            id={checkoutConfig.id}
            paywallConfig={checkoutConfig.config}
            setCheckoutUrl={setCheckoutUrl}
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
                            submitConfigurationMutation.isLoading ||
                            deleteConfigurationMutation.isLoading
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
                        <Button
                          className="ml-auto"
                          disabled={!checkoutConfig.id}
                          iconLeft={<TrashIcon />}
                          onClick={(event) => {
                            event.preventDefault()
                            setDeleteConfirmation(true)
                          }}
                          size="small"
                        >
                          Delete
                        </Button>
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
                  button: {
                    disabled: hasRecurringPlaceholder,
                  },
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
                      setCheckoutUrl={setCheckoutUrl}
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
