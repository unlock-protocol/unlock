import { Button, Input } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'

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

export const UpdateHooksForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  version,
}: UpdateHooksFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormProps>({
    defaultValues: {},
  })

  const disabledInput = disabled

  const isValidAddress = (address?: string) => {
    return address?.length ? ethers.utils.isAddress(address) : false
  }

  const onSubmit = (fields: FormProps) => {
    if (isValid) {
      console.log(lockAddress, network, fields)
    } else {
      ToastHelper.error('Form is not valid')
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
      {version && version >= 7 && (
        <>
          <Input
            {...register('keyPurchase', {
              validate: isValidAddress,
            })}
            label="Key purchase hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyPurchase && 'Enter a valid address'}
          />

          <Input
            {...register('keyCancel', {
              validate: isValidAddress,
            })}
            label="Key cancel hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyCancel && 'Enter a valid address'}
          />
        </>
      )}
      {version && version >= 9 && (
        <>
          <Input
            {...register('validKey', {
              validate: isValidAddress,
            })}
            label="Valid key hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.validKey && 'Enter a valid address'}
          />
          <Input
            {...register('tokenURI', {
              validate: isValidAddress,
            })}
            label="Token URI hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.tokenURI && 'Enter a valid address'}
          />
        </>
      )}
      {version && version >= 11 && (
        <>
          <Input
            {...register('keyTransfer', {
              validate: isValidAddress,
            })}
            label="Key transfer hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyTransfer && 'Enter a valid address'}
          />
        </>
      )}
      {version && version >= 12 && (
        <>
          <Input
            {...register('keyExtend', {
              validate: isValidAddress,
            })}
            label="Key extend hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyExtend && 'Enter a valid address'}
          />
          <Input
            {...register('keyGrant', {
              validate: isValidAddress,
            })}
            label="Key grant hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyGrant && 'Enter a valid address'}
          />
        </>
      )}
      {isManager && (
        <Button className="w-full md:w-1/3" type="submit">
          Apply
        </Button>
      )}
    </form>
  )
}
