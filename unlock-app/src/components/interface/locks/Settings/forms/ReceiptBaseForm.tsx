import { Placeholder, TextBox, ToggleSwitch } from '@unlock-protocol/ui'
import { Input, Button } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useGetReceiptsBase, useUpdateReceiptsBase } from '~/hooks/useReceipts'
import { z } from 'zod'

const SupplierSchema = z.object({
  vat: z.string().optional(),
  vatRatePercentage: z.number().nullish().default(null),
  supplierName: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  servicePerformed: z.string().optional(),
})

type SupplierBodyProps = z.infer<typeof SupplierSchema>
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
  const [vatPercentage, setVatPercentage] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, errors },
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

  if (isLoadingDetails) {
    return (
      <Placeholder.Root className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Placeholder.Line size="xl" />
        <Placeholder.Root className="grid grid-cols-1 col-span-2 gap-4 md:grid-cols-2">
          <Placeholder.Line size="xl" />
          <Placeholder.Line size="xl" />
        </Placeholder.Root>
        <Placeholder.Line size="xl" />
        <Placeholder.Line size="xl" />
        <Placeholder.Line size="xl" />
        <Placeholder.Line size="xl" />
        <Placeholder.Line size="xl" />
        <Placeholder.Line size="xl" />
      </Placeholder.Root>
    )
  }

  return (
    <form
      className="grid grid-cols-1 gap-6 text-left"
      onSubmit={handleSubmit(onHandleSubmit)}
    >
      <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-2">
        <Input
          disabled={disabledInput}
          label="Supplier name"
          {...register('supplierName')}
        />
        <div className="grid grid-cols-1 col-span-2 gap-4 md:grid-cols-2">
          <div className="mt-1">
            <Input disabled={disabledInput} label="VAT" {...register('vat')} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="px-1 text-base" htmlFor="">
                VAT rate (%)
              </label>
              <ToggleSwitch
                title="Enable"
                enabled={vatPercentage}
                setEnabled={setVatPercentage}
                onChange={(enabled) => {
                  if (!enabled) {
                    setValue('vatRatePercentage', null, {
                      shouldValidate: true,
                    })
                  }
                }}
              />
            </div>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              disabled={disabledInput || !vatPercentage}
              error={errors?.vatRatePercentage?.message}
              {...register('vatRatePercentage', {
                valueAsNumber: true,
              })}
            />
          </div>
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
