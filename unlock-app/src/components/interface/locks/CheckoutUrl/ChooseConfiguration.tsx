import { classed } from '@tw-classed/react'
import { ReactNode, useEffect, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { Input, Placeholder, Select } from '@unlock-protocol/ui'
import { useController, useFormContext } from 'react-hook-form'
import { Configuration } from '.'
import { CheckoutConfig } from '@unlock-protocol/core'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useLockManager } from '~/hooks/useLockManager'
import { ToastHelper } from '~/components/helpers/toast.helper'

const RadioContentWrapper = classed.div('grid grid-cols-[24px_1fr] gap-2', {
  variants: {
    disabled: {
      true: 'opacity-50 pointer-events-none',
    },
  },
})

interface ConfigurationOptions {
  label: string
  key: Configuration
  disabled?: boolean
  children?: ReactNode
}
interface ChooseConfigurationProps {
  items: CheckoutConfig[]
  onChange(config: CheckoutConfig): void
  configuration: Configuration
  setConfiguration: (config: any) => void
  value: CheckoutConfig
  disabled?: boolean
  control: any
  name: string
  loading?: boolean
}

const Radio = ({ checked }: any) => {
  return (
    <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full border-brand-ui-primary">
      {checked && (
        <div className="w-3 h-3 rounded-full bg-brand-ui-primary"></div>
      )}
    </div>
  )
}

const ChooseConfigurationPlaceholder = () => {
  return (
    <Placeholder.Root className="grid gap-4">
      <Placeholder.Root>
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="md" />
      </Placeholder.Root>
      <Placeholder.Root>
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="md" />
      </Placeholder.Root>
    </Placeholder.Root>
  )
}

export const ConnectForm = ({ children }: any) => {
  const methods = useFormContext()
  return children({ ...methods })
}

export function ChooseConfiguration({
  items,
  onChange,
  value,
  disabled,
  control,
  name,
  configuration,
  setConfiguration,
  loading,
}: ChooseConfigurationProps) {
  const {
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: {
        value: configuration === 'new',
        message: 'This field is required.',
      },
    },
  })

  const [selectedConfig, setSelectedConfig] = useState<
    CheckoutConfig | undefined
  >(undefined)

  const [defaultValue, setDefaultValue] = useState<string | null>(
    selectedConfig?.id || value?.id
  )

  const [customConfigId, setCustomConfigId] = useState<string | null>(null)

  const { account } = useAuth()
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false)
  const [locksToCheck, setLocksToCheck] = useState<
    Array<{ address: string; network: number }>
  >([])

  const { data: configDetails, isLoading: isLoadingConfig } = useCheckoutConfig(
    { id: customConfigId! }
  )

  const { isManager, isPending: isCheckingLockManager } = useLockManager({
    lockAddress: locksToCheck[0]?.address,
    network: locksToCheck[0]?.network,
  })

  // Reset state when customConfigId or value changes
  useEffect(() => {
    setIsCheckingPermissions(false)
    setLocksToCheck([])
    setSelectedConfig(undefined)
  }, [customConfigId, value])

  // Populate locks to check when config details are available
  useEffect(() => {
    if (configDetails && account) {
      const locks = Object.entries(configDetails.config.locks).map(
        ([address, lockConfig]: [string, any]) => ({
          address,
          network: lockConfig.network,
        })
      )
      setLocksToCheck(locks)
      setIsCheckingPermissions(true)
    }
  }, [configDetails, account])

  useEffect(() => {
    if (!value?.id) return
    setDefaultValue(value?.id)
  }, [value?.id, value?.name])

  const configOptions = items?.map((config) => {
    return {
      label: config.name,
      value: `${config.id}`,
    }
  })

  const onSelectConfig = (configId: string | number) => {
    const config = items.find((item) => item.id === configId)
    if (config) {
      setSelectedConfig(config)
      onChange(config)
    }
  }

  useEffect(() => {
    if (isCheckingPermissions && !isCheckingLockManager) {
      if (isManager) {
        // If user is a manager, check next lock or finish checking
        if (locksToCheck.length > 1) {
          setLocksToCheck((prev) => prev.slice(1))
        } else {
          setIsCheckingPermissions(false)
          if (configDetails?.id) {
            onSelectConfig(configDetails.id)
          }
        }
      } else {
        // If user is not a manager, check next lock or show error
        if (locksToCheck.length > 1) {
          setLocksToCheck((prev) => prev.slice(1))
        } else {
          setIsCheckingPermissions(false)
          ToastHelper.error(
            'You do not have permission to use this configuration.'
          )
        }
      }
    }
  }, [isManager, isCheckingLockManager, locksToCheck, configDetails])

  if (loading) {
    return <ChooseConfigurationPlaceholder />
  }

  const configs: ConfigurationOptions[] = [
    {
      key: 'new',
      label: 'Create a new one',
      children: (
        <ConnectForm>
          {({ register }: any) => {
            return (
              <Input
                placeholder="Enter name"
                type="text"
                {...register('configName')}
                error={error?.message}
                onKeyDown={(e) => {
                  // Prevent the `RadioGroup` itself from "eating" characters
                  e.stopPropagation()
                }}
              />
            )
          }}
        </ConnectForm>
      ),
    },
    {
      key: 'existing',
      label: 'Edit existing',
      children: (
        <Select
          disabled={items?.length === 0}
          options={configOptions}
          onChange={(value, isCustom) => {
            if (isCustom) {
              // Handle custom input
              setCustomConfigId(value?.toString())
              setIsCheckingPermissions(false)
              setLocksToCheck([])
              setSelectedConfig(undefined)
            } else {
              // Handle selection from existing options
              onSelectConfig(value?.toString())
            }
          }}
          defaultValue={defaultValue}
          customOption={true}
        />
      ),
    },
  ]

  return (
    <>
      <RadioGroup
        className="grid gap-6"
        value={configuration}
        onChange={(config) => {
          setConfiguration(config)
          if (config === 'new') {
            setSelectedConfig(undefined)
          }
          // Reset states when configuration changes
          setCustomConfigId(null)
          setIsCheckingPermissions(false)
          setLocksToCheck([])
        }}
        disabled={disabled}
      >
        {configs?.map(({ key: value, label, children, disabled }) => {
          const isSelected = configuration === value

          return (
            <div className="w-full" key={value}>
              <RadioGroup.Option value={value} disabled={disabled}>
                {({ checked }) => (
                  <>
                    <RadioGroup.Label>
                      <div className="flex flex-col gap-2">
                        <RadioContentWrapper
                          className={`${
                            disabled ? '' : 'cursor-pointer'
                          } items-center `}
                        >
                          <Radio checked={checked} />
                          <span>{label}</span>
                        </RadioContentWrapper>
                      </div>
                    </RadioGroup.Label>
                  </>
                )}
              </RadioGroup.Option>
              <RadioContentWrapper className="mt-2" disabled={!isSelected}>
                <div className="col-start-2">
                  {children}
                  {/* Show loading indicator when checking permissions for existing config */}
                  {value === 'existing' &&
                    (isLoadingConfig || isCheckingPermissions) && (
                      <div className="mt-2 text-sm">
                        Checking permissions...
                      </div>
                    )}
                </div>
              </RadioContentWrapper>
            </div>
          )
        })}
      </RadioGroup>
    </>
  )
}
