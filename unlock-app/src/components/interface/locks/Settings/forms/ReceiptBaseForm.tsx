import { useMutation, useQuery } from '@tanstack/react-query'
import { TextBox } from '@unlock-protocol/ui'
import { Input, Button } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { storage } from '~/config/storage'

import { SupplierBodyProps } from '../../../../../../../locksmith/src/controllers/v2/receiptBaseController'

interface ReceiptBaseFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}
export const ReceiptBaseForm = ({
  lockAddress,
  isManager,
  disabled,
  network,
}: ReceiptBaseFormProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isValid },
  } = useForm<SupplierBodyProps>({
    mode: 'onChange',
  })

  const getReceiptBase = async (): Promise<any> => {
    return await storage.getReceiptsBase(network, lockAddress)
  }

  const saveReceiptBase = async (): Promise<any> => {
    if (!isManager) return
    const supplier = await getValues()
    return await storage.saveReceiptsBase(network, lockAddress, {
      data: {
        ...supplier,
      },
    })
  }

  const receiptBaseMutation = useMutation(saveReceiptBase)

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(receiptBaseMutation.mutateAsync(), {
        loading: 'Updating  supplier details,',
        success: 'Supplier updated',
        error: 'We could not update the details.',
      })
    } else {
      ToastHelper.error('Form is not valid')
      reset()
    }
  }

  const { isLoading: isLoadingDetails } = useQuery(
    ['getReceiptBase', lockAddress, network, receiptBaseMutation.isSuccess],
    async () => {
      return getReceiptBase()
    },
    {
      onSuccess: (res) => {
        if (res.data) {
          reset(res.data)
        }
      },
      enabled: isManager,
    }
  )

  const disabledInput =
    receiptBaseMutation.isLoading || disabled || isLoadingDetails

  return (
    <form
      className="flex flex-col gap-6 text-left"
      onSubmit={handleSubmit(onHandleSubmit)}
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          disabled={disabledInput}
          label="Supplier name"
          {...register('supplierName')}
        />
        <Input disabled={disabledInput} label="VAT" {...register('vat')} />

        <div className="col-span-2">
          <TextBox
            disabled={disabledInput}
            label="Service performed"
            {...register('servicePerformed')}
          />
        </div>
        <Input
          disabled={disabledInput}
          label="Address line 1"
          {...register('addressLine1')}
        />
        <Input
          disabled={disabledInput}
          label="Address line 2"
          {...register('addressLine2')}
        />
        <Input disabled={disabledInput} label="City" {...register('city')} />
        <Input disabled={disabledInput} label="State" {...register('state')} />
        <Input disabled={disabledInput} label="Zip" {...register('zip')} />
        <Input
          disabled={disabledInput}
          label="Country"
          {...register('country')}
        />
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={receiptBaseMutation.isLoading}
        >
          Update
        </Button>
      )}
    </form>
  )
}
