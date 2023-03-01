import { useMutation, useQueries } from '@tanstack/react-query'
import { Button, Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { HookName } from '@unlock-protocol/types'
import networks from '@unlock-protocol/networks'

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
interface HookValueProps {
  label: string
  fromPublicLockVersion: number
  hookName: HookName
}

const HookMapping: Record<FormPropsKey, HookValueProps> = {
  keyPurchase: {
    label: 'Key purchase hook',
    fromPublicLockVersion: 7,
    hookName: 'onKeyPurchaseHook',
  },
  keyCancel: {
    label: 'Key purchase hook',
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

interface CustomHookSelectProps {
  label: string
  description?: string
  name: string
  network: number
  hookName?: HookName
  defaultValue?: string
}

const CustomHookSelect = ({
  label,
  network,
  hookName,
  defaultValue = '',
}: CustomHookSelectProps) => {
  const hooksByName = networks[network!].hooks?.[hookName!]
  const [hookValue, setHookValue] = useState('')
  const [hookAddress, setHookAddress] = useState(defaultValue)
  const [isCustom, setIsCustom] = useState<boolean>(false)

  const options = Object.values(hooksByName ?? {}).map(({ name, address }) => {
    return {
      value: address,
      label: name,
    }
  })

  useEffect(() => {
    setHookAddress(defaultValue)
  }, [defaultValue])

  const onSelectChange = (value: string | number, isCustom?: boolean) => {
    setHookAddress(`${value}`)
    setIsCustom(isCustom!)
  }

  return (
    <div className="flex flex-col w-full gap-2 p-4 bg-white border border-gray-200 rounded-2xl">
      <Select
        label={label}
        options={options}
        customOption={true}
        onChange={onSelectChange}
      />
      {!isCustom && (
        <>
          {hookAddress !== ZERO && (
            <Input
              label="Hook value"
              onChange={(e: any) => setHookValue(e?.target?.value)}
            />
          )}
          <Input
            value={hookAddress}
            label="Hook address"
            onChange={(e: any) => setHookAddress(e?.target?.value)}
            disabled={!isCustom}
          />
        </>
      )}
    </div>
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
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
    getValues,
  } = useForm<Partial<Record<FormPropsKey, string>>>()

  const isValidAddress = (address?: string) => {
    return address?.length ? ethers.utils.isAddress(address) : true
  }

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

  const toggleField = (field: FormPropsKey) => {
    const fieldStatus = enabledFields[field]
    setEnabledFields({
      ...enabledFields,
      [field]: !fieldStatus,
    })

    if (fieldStatus) {
      setValue(field, DEFAULT_USER_ACCOUNT_ADDRESS)
    }
  }

  const disabledInput =
    disabled || setEventsHooksMutation.isLoading || isLoading

  const hookNames: HookName[] = Object.keys(
    networks[network].hooks ?? {}
  ) as HookName[]

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
      {Object.entries(HookMapping)?.map(
        ([field, { label, fromPublicLockVersion = 0, hookName }]) => {
          const fieldName = field as FormPropsKey
          const hasRequiredVersion = version && version >= fromPublicLockVersion
          const enabled: boolean = enabledFields[fieldName] ?? false
          const hasError = errors?.[hookName as FormPropsKey]

          const hasCustomHookFromNetwork = hookNames.includes(hookName)

          if (!hasRequiredVersion) return null

          if (hasCustomHookFromNetwork) {
            const defaultValue = getValues(field as any)
            return (
              <CustomHookSelect
                key={hookName}
                label={label}
                name={field}
                network={network}
                hookName={hookName}
                defaultValue={defaultValue}
              />
            )
          }

          return (
            hasRequiredVersion && (
              <div key={hookName}>
                <ToggleSwitch
                  title={label}
                  enabled={enabled}
                  setEnabled={() => toggleField(fieldName)}
                  disabled={disabledInput}
                />
                <Input
                  {...register(fieldName, {
                    validate: isValidAddress,
                  })}
                  disabled={disabledInput || !enabled}
                  placeholder="Contract address, for ex: 0x00000000000000000"
                  error={hasError && 'Enter a valid address'}
                />
              </div>
            )
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
  )
}
