import { classed } from '@tw-classed/react'
import { ReactNode, useEffect, useState, useCallback } from 'react'
import { RadioGroup } from '@headlessui/react'
import { Combobox, Input, Placeholder } from '@unlock-protocol/ui'
import { useController, useFormContext } from 'react-hook-form'
import { CheckoutConfig } from '@unlock-protocol/core'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { useMultipleLockManagers } from '~/hooks/useLockManager'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Configuration } from '.'
import { useAuthenticate } from '~/hooks/useAuthenticate'

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
  setConfiguration: (config: Configuration) => void
  value: CheckoutConfig
  disabled?: boolean
  control: any
  name: string
  loading?: boolean
}

const Radio = ({ checked }: { checked: boolean }) => {
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

export const ConnectForm = ({
  children,
}: {
  children: (props: any) => ReactNode
}) => {
  const methods = useFormContext()
  return <>{children({ ...methods })}</>
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
  const [customConfigId, setCustomConfigId] = useState<string | null>(null)
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false)
  const [locksToCheck, setLocksToCheck] = useState<
    Array<{ address: string; network: number }>
  >([])

  const { account } = useAuthenticate()

  // Fetch the configuration's details when customConfigId changes
  const { data: configDetails, isLoading: isLoadingConfig } = useCheckoutConfig(
    { id: customConfigId! }
  )

  // check if the user is a manager for the locks in the configuration
  const { isManager, isPending: isCheckingLockManager } =
    useMultipleLockManagers({
      locks: locksToCheck,
    })

  // Initialize the lock checks when configDetails are available
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

  // Reset the state when customConfigId or value changes
  useEffect(() => {
    setIsCheckingPermissions(false)
    setLocksToCheck([])
    setSelectedConfig(undefined)
  }, [customConfigId, value])

  // Set default value based on existing value prop
  useEffect(() => {
    if (value?.id) {
      setSelectedConfig(value)
    }
  }, [value])

  /**
   * Handler to process lock manager permissions.
   * Check if user is a manager for at least one lock.
   */
  useEffect(() => {
    if (isCheckingPermissions && !isCheckingLockManager) {
      if (isManager) {
        // User is a manager for at least one lock
        setIsCheckingPermissions(false)
        if (configDetails?.id) {
          onSelectConfig(configDetails.id)
        }
      } else {
        // User is not a manager for any lock
        setIsCheckingPermissions(false)
        ToastHelper.error(
          'You do not have permission to use this configuration.'
        )
        setCustomConfigId(null)
      }
    }
  }, [
    isManager,
    isCheckingLockManager,
    isCheckingPermissions,
    configDetails,
    onChange,
  ])

  /**
   * Memoized Handler to Select a Configuration
   */
  const onSelectConfig = useCallback(
    (configId: string | number) => {
      const config = items.find((item) => item.id === configId)
      if (config) {
        setSelectedConfig(config)
        onChange(config)
      }
    },
    [items, onChange]
  )

  // Prepare the select options
  const configOptions: { label: string; value: string }[] =
    items
      ?.filter((config) => config.id != null)
      .map((config) => ({
        label: config.name,
        value: config.id as string,
      })) || []

  const handleSelectChange = (value: string | number, isCustom?: boolean) => {
    if (isCustom) {
      // User chose to enter a custom config ID
      setCustomConfigId(value.toString())
      setSelectedConfig(undefined)
      setIsCheckingPermissions(false)
      setLocksToCheck([])
    } else {
      // User selected an existing config
      onSelectConfig(value.toString())
    }
  }

  // Show Loading Placeholder when loading
  if (loading) {
    return <ChooseConfigurationPlaceholder />
  }

  // Define Configuration Options for RadioGroup
  const configs: ConfigurationOptions[] = [
    {
      key: 'new',
      label: 'Create a new one',
      children: (
        <ConnectForm>
          {({ register }: any) => (
            <Input
              placeholder="Enter name"
              type="text"
              {...register('configName')}
              error={error?.message}
              onKeyDown={(e) => {
                // Prevent the `RadioGroup` from "eating" characters
                e.stopPropagation()
              }}
            />
          )}
        </ConnectForm>
      ),
    },
    {
      key: 'existing',
      label: 'Edit existing',
      children: (
        <div className="w-full">
          <Combobox
            disabled={items?.length === 0}
            options={configOptions}
            maxWidth="max-w-2xl"
            onChange={handleSelectChange}
            defaultValue={selectedConfig?.id || value?.id || ''}
            customOption={true}
            placeholder="Select or enter configuration ID"
          />
        </div>
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
        {configs.map(({ key: value, label, children, disabled }) => {
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
                          } items-center`}
                          disabled={disabled}
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
                  {/* Show status indicator when checking permissions for existing config */}
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
