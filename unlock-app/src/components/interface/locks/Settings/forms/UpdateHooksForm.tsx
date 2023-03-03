import { useMutation, useQueries } from '@tanstack/react-query'
import { Button, Select } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { HookName } from '@unlock-protocol/types'
import { ConnectForm } from '../../CheckoutUrl/elements/DynamicForm'
import { CustomContractHook } from './hooksComponents/CustomContractHook'
import { PasswordContractHook } from './hooksComponents/PasswordContractHook'

const ZERO = ethers.constants.AddressZero

enum HookType {
  CUSTOM_ADDRESS = 'CUSTOM_ADDRESS',
}
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
interface HookValueProps {
  label: string
  fromPublicLockVersion: number
  hookName: HookName
}

export interface CustomComponentProps {
  name: string
  disabled: boolean
  selectedOption?: string
}

const OPTIONS: {
  label: string
  value: HookType | string
  component: (args: CustomComponentProps) => JSX.Element
}[] = [
  {
    label: 'Custom Contract',
    value: HookType.CUSTOM_ADDRESS,
    component: (args) => <CustomContractHook {...args} />,
  },
  // todo: show only for match of `hooks` from `networks`
  {
    label: 'Password',
    value: 'password',
    component: (args) => <PasswordContractHook {...args} />,
  },
]

const HookMapping: Record<FormPropsKey, HookValueProps> = {
  keyPurchase: {
    label: 'Key purchase hook',
    fromPublicLockVersion: 7,
    hookName: 'onKeyPurchaseHook',
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
  name: string
  disabled: boolean
}

const HookSelect = ({ name, label, disabled }: HookSelectProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  return (
    <ConnectForm>
      {() => {
        const Option = OPTIONS.find((option) => option.value === selectedOption)

        return (
          <div className="flex flex-col gap-1">
            <Select
              options={OPTIONS}
              label={label}
              onChange={(value) => {
                setSelectedOption(`${value}`)
              }}
            />
            {Option?.component && (
              <div className="w-full p-4 border border-gray-500 rounded-lg">
                {Option.component({
                  name,
                  disabled,
                  selectedOption: selectedOption ?? '',
                })}
              </div>
            )}
          </div>
        )
      }}
    </ConnectForm>
  )
}

export const UpdateHooksForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  version,
}: UpdateHooksFormProps) => {
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()

  const [enabledFields, setEnabledFields] = useState<
    Record<FormPropsKey, boolean>
  >({
    keyPurchase: false,
    keyCancel: false,
    validKey: false,
    tokenURI: false,
    keyTransfer: false,
    keyExtend: false,
    keyGrant: false,
  })
  const methods = useForm<Partial<Record<FormPropsKey, string>>>()
  const {
    setValue,
    formState: { isValid },
  } = methods

  const setEventsHooks = async (fields: Partial<FormProps>) => {
    const walletService = await getWalletService(network)
    return await walletService.setEventHooks({
      lockAddress,
      ...fields,
    })
  }

  const setEventsHooksMutation = useMutation(setEventsHooks)

  const queries = useQueries({
    queries: [
      ...Object.entries(HookMapping).map(
        ([fieldName, { hookName, fromPublicLockVersion = 0 }]) => {
          const hasRequiredVersion: boolean =
            (version ?? 0) >= fromPublicLockVersion ?? false

          return {
            queryKey: [hookName, lockAddress, network],
            queryFn: async () => {
              return await web3Service[hookName]({ lockAddress, network })
            },
            enabled: hasRequiredVersion && lockAddress?.length > 0,
            onSuccess: (value: string) => {
              setValue(fieldName as FormPropsKey, value ?? ZERO)

              setEnabledFields({
                ...enabledFields,
                [fieldName]: value !== ZERO,
              })
            },
          }
        }
      ),
    ],
  })

  const isLoading = queries?.some(({ isLoading }) => isLoading)

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
