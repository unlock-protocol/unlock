import { Button, Drawer, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { useUpdateReceipt } from '~/hooks/useReceipts'
import { ToastHelper } from '~/components/helpers/toast.helper'

type PurchaserBodyProps = any
export interface Props {
  lockAddress: string
  hash: string
  network: number
  isOpen: boolean
  setIsOpen(value: boolean): void
  purchaser?: Partial<PurchaserBodyProps>
  onSave: () => void
}

export function UpdatePurchaserDrawer({
  lockAddress,
  network,
  isOpen,
  setIsOpen,
  purchaser,
  hash,
  onSave,
}: Props) {
  const { register, handleSubmit } = useForm<PurchaserBodyProps>({
    mode: 'onChange',
    defaultValues: {
      ...purchaser,
    },
  })

  const { mutateAsync: updateReceiptMutation, isLoading } = useUpdateReceipt({
    lockAddress,
    network,
    hash,
  })

  const onSubmit = async (formData: PurchaserBodyProps) => {
    await ToastHelper.promise(updateReceiptMutation(formData), {
      loading: 'Updating purchaser details.',
      success: 'Purchaser details updated.',
      error: 'There is some issue updating purchaser details.',
    })
    onSave()
  }

  const disabledInput = isLoading

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen} title="Purchaser Details">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 div">
            <Input
              disabled={disabledInput}
              label="Full name"
              {...register('fullname')}
            />
          </div>

          <div className="col-span-2">
            <Input
              disabled={disabledInput}
              label="Business name"
              {...register('businessName')}
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
          <Input
            disabled={disabledInput}
            label="State"
            {...register('state')}
          />
          <Input disabled={disabledInput} label="Zip" {...register('zip')} />
          <Input
            disabled={disabledInput}
            label="Country"
            {...register('country')}
          />
        </div>
        <Button className="w-full" type="submit" disabled={disabledInput}>
          Update
        </Button>
      </form>
    </Drawer>
  )
}
