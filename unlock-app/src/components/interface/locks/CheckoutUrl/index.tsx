import { Button, Modal } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { PaywallConfigType as PaywallConfig } from '@unlock-protocol/core'
import { CheckoutForm } from './elements/CheckoutForm'
import { CheckoutPreview } from './elements/CheckoutPreview'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import ConfigComboBox, { CheckoutConfig } from './ComboBox'
import {
  useCheckoutConfigRemove,
  useCheckoutConfigUpdate,
  useCheckoutConfigsByUser,
} from '~/hooks/useCheckoutConfig'
import { FaTrash as TrashIcon, FaSave as SaveIcon } from 'react-icons/fa'
import { useLockSettings } from '~/hooks/useLockSettings'
import { useQuery } from '@tanstack/react-query'
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
  const { lock: lockAddress, network } = query ?? {}
  const [isDeleteConfirmation, setDeleteConfirmation] = useState(false)
  const { getIsRecurringPossible } = useLockSettings()
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
      pessimistic: true,
      skipRecipient: true,
    },
  })

  // retrieve recurringPayments when lock is present in url
  useEffect(() => {
    if ((!lockAddress && !network) || isRecurringSettingPlaceholder) return
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
  }, [lockAddress, network, isRecurringSettingPlaceholder, recurringSetting])

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
      pessimistic: true,
      skipRecipient: true,
    } as PaywallConfig
  }, [recurringSetting, lockAddress, network])

  const { data: checkoutConfigList, refetch: refetchConfig } =
    useCheckoutConfigsByUser()

  const { mutateAsync: updateConfig, isLoading: isConfigUpdating } =
    useCheckoutConfigUpdate()

  const { mutateAsync: removeConfig, isLoading: isConfigRemoving } =
    useCheckoutConfigRemove()

  const onConfigSave = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault()
      const updated = await updateConfig({
        config: checkoutConfig.config,
        name: checkoutConfig.name,
        id: checkoutConfig.id,
      })
      setCheckoutConfig({
        id: updated.id,
        name: updated.name,
        config: updated.config as PaywallConfig,
      })
      await refetchConfig()
    },
    [checkoutConfig, updateConfig, refetchConfig]
  )

  const onConfigRemove = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault()
      if (!checkoutConfig.id) {
        setDeleteConfirmation(false)
        return
      }
      await removeConfig(checkoutConfig.id)
      const { data: list } = await refetchConfig()
      const result = list?.[0]
      setCheckoutConfig({
        id: result?.id || null,
        name: result?.name || 'config',
        config: (result?.config as PaywallConfig) || DEFAULT_CONFIG,
      })
      setDeleteConfirmation(false)
    },
    [
      checkoutConfig,
      removeConfig,
      refetchConfig,
      DEFAULT_CONFIG,
      setDeleteConfirmation,
    ]
  )
  useEffect(() => {
    const checkout = checkoutConfigList?.[0]
    if (!checkout) return

    setCheckoutConfig({
      id: checkout.id,
      name: checkout.name,
      config: checkout.config as PaywallConfig,
    })
  }, [checkoutConfigList])

  const onAddLocks = (locks: any) => {
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

  const onBasicConfigChange = (fields: Partial<PaywallConfig>) => {
    const hasDefaultLock =
      Object.keys(fields?.locks ?? {}).length === 0 && lockAddress && network

    if (hasDefaultLock) {
      fields = {
        ...fields,
        locks: {
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
          ...fields,
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
              onClick={onConfigRemove}
            >
              Delete {checkoutConfig.name}
            </Button>
          </div>
        </div>
      </Modal>
      <TopBar />
      <div className="flex flex-col w-full min-h-screen gap-8 pt-10 pb-20 md:flex-row">
        <div className="md:w-1/2">
          <CheckoutPreview
            id={checkoutConfig.id}
            paywallConfig={checkoutConfig.config}
          />
        </div>
        <div className="flex flex-col gap-4 md:w-1/2">
          <Header />
          <div className="flex items-center w-full gap-4 p-2">
            <div className="w-full">
              <ConfigComboBox
                items={
                  (checkoutConfigList as unknown as CheckoutConfig[]) ||
                  ([] as CheckoutConfig[])
                }
                onChange={(value) => {
                  setCheckoutConfig({
                    id: value.id,
                    name: value.name,
                    config: value.config || DEFAULT_CONFIG,
                  })
                }}
                value={checkoutConfig}
              />
            </div>
            <Button
              loading={isConfigUpdating}
              disabled={isRecurringSettingPlaceholder}
              iconLeft={<SaveIcon />}
              onClick={onConfigSave}
              size="small"
            >
              Save
            </Button>
            <Button
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
          <CheckoutForm
            key={checkoutConfig.id}
            onAddLocks={onAddLocks}
            onBasicConfigChange={onBasicConfigChange}
            paywallConfig={checkoutConfig.config}
          />
        </div>
      </div>
    </>
  )
}
