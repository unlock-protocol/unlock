import { TextBox } from '@unlock-protocol/ui'
import { Input, Button } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useGetReceiptsBase, useUpdateReceiptsBase } from '~/hooks/receipts'

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
    reset,
    formState: { isValid },
  } = useForm<SupplierBodyProps>({
    mode: 'onChange',
  })

  const { data: receiptsBase, isLoading: isLoadingDetails } =
    useGetReceiptsBase({
      lockAddress,
      network,
      isManager,
    })

  const {
    mutateAsync: receiptBaseMutation,
    isLoading: isReceiptsBaseUpdating,
  } = useUpdateReceiptsBase({
    lockAddress,
    network,
    isManager,
  })

  const onHandleSubmit = async (data: SupplierBodyProps) => {
    if (isValid) {
      await ToastHelper.promise(receiptBaseMutation(data), {
        loading: 'Updating  supplier details.',
        success: 'Supplier updated',
        error: 'We could not update the details.',
      })
    } else {
      ToastHelper.error('Form is not valid')
      reset()
    }
  }

  useEffect(() => {
    if (receiptsBase) {
      reset(receiptsBase)
    }
  }, [receiptsBase, reset])

  const disabledInput = isReceiptsBaseUpdating || disabled || isLoadingDetails

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
        <div className="col-span-2">
          <TextBox
            disabled={disabledInput}
            label="Service performed"
            {...register('servicePerformed')}
          />
        </div>
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={isReceiptsBaseUpdating}
        >
          Update
        </Button>
      )}
    </form>
  )
}
