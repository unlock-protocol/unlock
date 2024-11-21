import { useMutation } from '@tanstack/react-query'
import { Select } from '@unlock-protocol/ui'
import { useRef, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Hook, HookName, HookType } from '@unlock-protocol/types'
import { CustomContractHook } from './hooksComponents/CustomContractHook'
import { PasswordCappedContractHook } from './hooksComponents/PasswordCappedContractHook'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { useConfig } from '~/utils/withConfig'
import { CaptchaContractHook } from './hooksComponents/CaptchaContractHook'
import { GuildContractHook } from './hooksComponents/GuildContractHook'
import { PromoCodeHook } from './hooksComponents/PromoCodeHook'
import { useCustomHook } from '~/hooks/useCustomHooks'
import { GitcoinContractHook } from './hooksComponents/GitcoinContractHook'
import { AllowListHook } from './hooksComponents/AllowListHook'
import { useProvider } from '~/hooks/useProvider'

interface UpdateHooksFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  version?: bigint
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
  setEventsHooksMutation: any
}

const GENERAL_OPTIONS: OptionProps[] = [
  {
    label: 'Custom Contract',
    value: HookType.CUSTOM_CONTRACT,
    component: (args) => <CustomContractHook {...args} />,
  },
]

export const HookMapping: Record<FormPropsKey, HookValueProps> = {
  keyPurchase: {
    label: 'Key purchase hook',
    fromPublicLockVersion: 7,
    hookName: 'onKeyPurchaseHook',
    options: [
      {
        label: 'Password',
        value: HookType.PASSWORD_CAPPED,
        component: (args) => <PasswordCappedContractHook {...args} />,
      },
      {
        label: 'Captcha required',
        value: HookType.CAPTCHA,
        component: (args) => <CaptchaContractHook {...args} />,
      },
      {
        label: 'Guild.xyz',
        value: HookType.GUILD,
        component: (args) => <GuildContractHook {...args} />,
      },
      {
        label: 'Discount code',
        value: HookType.PROMO_CODE_CAPPED,
        component: (args) => <PromoCodeHook {...args} />,
      },
      {
        label: 'Gitcoin Passport verification',
        value: HookType.GITCOIN,
        component: (args) => <GitcoinContractHook {...args} />,
      },
      {
        label: 'Allow List',
        value: HookType.ALLOW_LIST,
        component: (args) => <AllowListHook {...args} />,
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
  setEventsHooksMutation: any
}

const HookSelect = ({
  name,
  label,
  disabled,
  setEventsHooksMutation,
  lockAddress,
  network,
  defaultValues,
}: HookSelectProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>('')
  const [defaultValue, setDefaultValue] = useState<string>('')
  const firstRender = useRef(false)
  const { networks } = useConfig()
  const hooks = networks?.[network]?.hooks ?? {}
  const { setValue, getValues } = useFormContext()

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

  const hookAddress = getValues(name)
  const { hookName } = HookMapping[name]

  const hookOptionsByName = (HookMapping[name]?.options ?? []).filter(
    (option) => {
      const wasDeployed = hooks[hookName]?.find((deployedHook: Hook) => {
        return deployedHook.id === option.value
      })
      return wasDeployed
    }
  )
  const options = [...GENERAL_OPTIONS, ...hookOptionsByName]
  if (selectedOption !== '') {
    options.push({
      label: 'None',
      value: '',
      component: () => <></>,
    })
  }
  const Option = options.find((option) => option.value === selectedOption)

  let id = ''

  const handleSelectChange = async (hookType: string) => {
    if (!hookType) {
      await setEventsHooksMutation.mutateAsync({
        hookName: DEFAULT_USER_ACCOUNT_ADDRESS,
      })
      setValue(name, DEFAULT_USER_ACCOUNT_ADDRESS, {
        shouldValidate: true,
      })
      setSelectedOption(hookType)
      return
    }
    const hooksOfType = hooks[hookName]

    // get hook value from hooks of default one
    const hookValue =
      hooksOfType?.find((hook: Hook) => {
        return hook.id === hookType
      })?.address || hookAddress

    setSelectedOption(hookType)

    if (hookValue) {
      setValue(name, hookValue, {
        shouldValidate: true,
      })
    }
  }

  // set default value when present on render
  if (!firstRender.current && hookAddress?.length) {
    id = getHookIdByAddress(hookName, hookAddress)
    setDefaultValue(id)
    firstRender.current = true
  }

  return (
    <div className="flex flex-col gap-1">
      <Select
        options={options}
        label={label}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={(value: string) => handleSelectChange(value.toString())}
      />
      {Option?.component && (
        <div className="w-full p-4 border border-gray-500 rounded-lg">
          {Option.component({
            name,
            disabled,
            selectedOption: selectedOption ?? '',
            lockAddress,
            network,
            hookAddress,
            defaultValue: defaultValues?.[name] ?? '',
            setEventsHooksMutation,
          })}
        </div>
      )}
    </div>
  )
}

export type HooksFormProps = Partial<Record<FormPropsKey, string>>

export const UpdateHooksForm = ({
  lockAddress,
  network,
  disabled,
  version,
}: UpdateHooksFormProps) => {
  const { getWalletService } = useProvider()
  const [defaultValues, setDefaultValues] = useState<HooksFormProps>()

  const { isPending, refetch, getHookValues } = useCustomHook({
    lockAddress,
    network,
    version,
  })

  const methods = useForm<HooksFormProps>({
    defaultValues: async () => {
      const values = await getHookValues()
      setDefaultValues(values)
      return values
    },
  })

  const { reset } = methods

  const setEventsHooks = async (fields: Partial<FormProps>) => {
    const values = await getHookValues()
    let dirty = false
    Object.keys(fields).forEach((key) => {
      // @ts-expect-error Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Partial<FormProps>'.
      if (values[key] && fields[key] !== values[key]) {
        dirty = true
      }
    })
    if (!dirty) {
      return
    }

    const walletService = await getWalletService(network)

    await ToastHelper.promise(
      walletService.setEventHooks({
        lockAddress,
        ...fields,
      }),
      {
        success: 'Contract hooks updated.',
        loading: 'Updating hooks on the contract...',
        error: "Failed to update the contract's hooks.",
      }
    )
  }

  const setEventsHooksMutation = useMutation({
    mutationFn: setEventsHooks,
    onSuccess: async () => {
      const values = await getHookValues()
      setDefaultValues(values)
      reset(values)
      refetch()
    },
  })

  const disabledInput =
    disabled || setEventsHooksMutation.isPending || isPending

  return (
    <FormProvider {...methods}>
      <div className="flex gap-4 flex-col">
        {Object.entries(HookMapping)?.map(
          ([field, { label, fromPublicLockVersion = 0, hookName }]) => {
            const fieldName = field as FormPropsKey
            const hasRequiredVersion =
              version && version >= fromPublicLockVersion

            if (!hasRequiredVersion) return null

            return (
              <HookSelect
                setEventsHooksMutation={setEventsHooksMutation}
                key={hookName}
                label={`${label}:`}
                name={fieldName}
                disabled={disabledInput}
                lockAddress={lockAddress}
                network={network}
                defaultValues={defaultValues}
              />
            )
          }
        )}
      </div>
    </FormProvider>
  )
}
