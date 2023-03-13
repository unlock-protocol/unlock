import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Select } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Hook, HookName, HookType } from '@unlock-protocol/types'
import { ConnectForm } from '../../CheckoutUrl/elements/DynamicForm'
import { CustomContractHook } from './hooksComponents/CustomContractHook'
import { PasswordContractHook } from './hooksComponents/PasswordContractHook'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { useConfig } from '~/utils/withConfig'
import { CaptchaContractHook } from './hooksComponents/CaptchaContractHook'

const ZERO = ethers.constants.AddressZero

interface UpdateHooksFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  version?: number
}

interface FormProps {
  keyPurchase: string
  keyCancel: string
  validKey?: string
  tokenURI?: string
  keyTransfer?: string
  keyExtend?: string
  keyGrant?: string
}

type FormPropsKey = keyof FormProps

interface OptionProps {
  label: string
  value: HookType | string
  component: (args: CustomComponentProps) => JSX.Element
}
interface HookValueProps {
  label: string
  fromPublicLockVersion: number
  hookName: HookName
  options?: OptionProps[]
}

export interface CustomComponentProps {
  name: string
  disabled: boolean
  selectedOption?: string
  lockAddress: string
  network: number
  hookAddress: string
  defaultValue?: string
}

const GENERAL_OPTIONS: OptionProps[] = [
  {
    label: 'Custom Contract',
    value: HookType.CUSTOM_CONTRACT,
    component: (args) => <CustomContractHook {...args} />,
  },
]

const HookMapping: Record<FormPropsKey, HookValueProps> = {
  keyPurchase: {
    label: 'Key purchase hook',
    fromPublicLockVersion: 7,
    hookName: 'onKeyPurchaseHook',
    options: [
      {
        label: 'Password',
        value: HookType.PASSWORD,
        component: (args) => <PasswordContractHook {...args} />,
      },
      {
        label: 'Captcha required',
        value: HookType.CAPTCHA,
        component: (args) => <CaptchaContractHook {...args} />,
      },
    ],
  },
  keyCancel: {
    label: 'Key cancel hook',
    fromPublicLockVersion: 7,
    hookName: 'onKeyCancelHook',
  },
  validKey: {
    label: 'Valid key hook',
    fromPublicLockVersion: 9,
    hookName: 'onValidKeyHook',
  },
  tokenURI: {
    label: 'Token URI hook',
    fromPublicLockVersion: 9,
    hookName: 'onTokenURIHook',
  },
  keyTransfer: {
    label: 'Key transfer hook',
    fromPublicLockVersion: 11,
    hookName: 'onKeyTransferHook',
  },
  keyExtend: {
    label: 'Key extend hook',
    fromPublicLockVersion: 12,
    hookName: 'onKeyExtendHook',
  },
  keyGrant: {
    label: 'Key grant hook',
    fromPublicLockVersion: 12,
    hookName: 'onKeyGrantHook',
  },
}

interface HookSelectProps {
  label: string
  name: FormPropsKey
  disabled: boolean
  network: number
  lockAddress: string
  defaultValues?: HooksFormProps
}

const HookSelect = ({
  name,
  label,
  disabled,
  lockAddress,
  network,
  defaultValues,
}: HookSelectProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>('')
  const [defaultValue, setDefaultValue] = useState<string>('')
  const firstRender = useRef(false)
  const { networks } = useConfig()
  const hooks = networks?.[network]?.hooks ?? {}

  const getHooks = () => {
    return hooks
  }

  const getHookIdByAddress = (name: HookName, address: string): string => {
    let id
    const idByAddress: string =
      hooks?.[name]?.find((hook: Hook) => hook.address === address)?.id ?? ''

    if (idByAddress) {
      id = idByAddress
    } else if (address !== DEFAULT_USER_ACCOUNT_ADDRESS) {
      id = HookType.CUSTOM_CONTRACT
    }
    return id as string
  }

  return (
    <ConnectForm>
      {({ setValue, getValues }: any) => {
        const value = getValues(name)
        const hookOptionsByName = HookMapping[name]?.options ?? []
        const options = [...GENERAL_OPTIONS, ...hookOptionsByName]
        const Option = options.find((option) => option.value === selectedOption)

        const { hookName } = HookMapping[name]

        let id = ''

        const handleSelectChange = (id: string) => {
          const hooks = getHooks()[hookName]

          // get hook value from hooks of default one
          const hookValue =
            hooks?.find((hook: Hook) => {
              return hook.id === id
            })?.address || value

          setSelectedOption(`${id}`)

          if (hookValue) {
            setValue(name, hookValue, {
              shouldValidate: true,
            })
          }
        }

        // set default value when present on render
        if (!firstRender.current && value?.length) {
          id = getHookIdByAddress(hookName, value)
          setDefaultValue(id)
          firstRender.current = true
        }

        return (
          <div className="flex flex-col gap-1">
            <Select
              options={options}
              label={label}
              defaultValue={defaultValue}
              onChange={(value) => {
                handleSelectChange(`${value}`)
              }}
            />
            {Option?.component && (
              <div className="w-full p-4 border border-gray-500 rounded-lg">
                {Option.component({
                  name,
                  disabled,
                  selectedOption: selectedOption ?? '',
                  lockAddress,
                  network,
                  hookAddress: value,
                  defaultValue: defaultValues?.[name] ?? '',
                })}
              </div>
            )}
          </div>
        )
      }}
    </ConnectForm>
  )
}

export type HooksFormProps = Partial<Record<FormPropsKey, string>>

export const UpdateHooksForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  version,
}: UpdateHooksFormProps) => {
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()
  const [defaultValues, setDefaultValues] = useState<HooksFormProps>()

  const getHookValues = async () => {
    let values = {}
    await Promise.all([
      ...Object.entries(HookMapping).map(
        async ([fieldName, { hookName, fromPublicLockVersion = 0 }]) => {
          const hasRequiredVersion: boolean =
            (version ?? 0) >= fromPublicLockVersion ?? false
          if (hasRequiredVersion) {
            const hookValue = await web3Service[hookName]({
              lockAddress,
              network,
            })
            values = {
              ...values,
              [fieldName]: hookValue || ZERO,
            }
          }
        }
      ),
    ])
    return values
  }

  const methods = useForm<HooksFormProps>({
    defaultValues: async () => {
      const values = await getHookValues()
      setDefaultValues(values)
      return values
    },
  })

  const {
    formState: { isValid },
    reset,
  } = methods

  const setEventsHooks = async (fields: Partial<FormProps>) => {
    const walletService = await getWalletService(network)
    return await walletService.setEventHooks({
      lockAddress,
      ...fields,
    })
  }

  const { isLoading, refetch } = useQuery(
    ['getHookValues', lockAddress, network],
    async () => await getHookValues(),
    {
      enabled: lockAddress?.length > 0,
    }
  )

  const setEventsHooksMutation = useMutation(setEventsHooks, {
    onSuccess: async () => {
      const values = await getHookValues()
      setDefaultValues(values)
      reset(values)
      refetch()
    },
  })

  const onSubmit = async (fields: Partial<FormProps>) => {
    if (isValid) {
      const setEventsHooksPromise = setEventsHooksMutation.mutateAsync(fields)
      await ToastHelper.promise(setEventsHooksPromise, {
        success: 'Event hooks updated.',
        loading: 'Updating Event hooks.',
        error: 'Impossible to update event hooks.',
      })
    } else {
      ToastHelper.error('Form is not valid')
    }
  }

  const disabledInput =
    disabled || setEventsHooksMutation.isLoading || isLoading

  return (
    <FormProvider {...methods}>
      <form
        className="grid gap-6"
        onSubmit={methods.handleSubmit(onSubmit)}
        onChange={() => {
          methods.trigger()
        }}
      >
        {Object.entries(HookMapping)?.map(
          ([field, { label, fromPublicLockVersion = 0, hookName }]) => {
            const fieldName = field as FormPropsKey
            const hasRequiredVersion =
              version && version >= fromPublicLockVersion

            if (!hasRequiredVersion) return null

            return (
              <HookSelect
                key={hookName}
                label={label}
                name={fieldName}
                disabled={disabledInput}
                lockAddress={lockAddress}
                network={network}
                defaultValues={defaultValues}
              />
            )
          }
        )}
        {isManager && (
          <Button
            className="w-full md:w-1/3"
            type="submit"
            loading={setEventsHooksMutation.isLoading}
          >
            Apply
          </Button>
        )}
      </form>
    </FormProvider>
  )
}
