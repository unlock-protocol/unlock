import { useMutation } from '@tanstack/react-query'
import { Button, Drawer, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { PurchaserBodyProps } from '../../../../../../locksmith/src/controllers/v2/receiptController'
import { storage } from '~/config/storage'

export interface Props {
  lockAddress: string
  hash: string
  network: number
  isOpen: boolean
  setIsOpen(value: boolean): void
  purchaser?: Partial<PurchaserBodyProps>
}

export function UpdatePurchaserDrawer({
  lockAddress,
  network,
  isOpen,
  setIsOpen,
  purchaser,
  hash,
}: Props) {
  const { register, handleSubmit } = useForm<PurchaserBodyProps>({
    mode: 'onChange',
    defaultValues: {
      ...purchaser,
    },
  })

  const savePurchaser = async (purchaser: PurchaserBodyProps): Promise<any> => {
    return await storage.savePurchaser(network, lockAddress, hash, {
      data: {
        ...purchaser,
      },
    })
  }

  const savePurchaserMutation = useMutation(
    ['savePurchaserDetails', lockAddress, network, hash],
    async (purchaser: PurchaserBodyProps) => {
      return savePurchaser(purchaser)
    }
  )

  const onSubmit = async (formData: PurchaserBodyProps) => {
    await savePurchaserMutation.mutateAsync(formData)
  }

  const disabledInput = savePurchaserMutation.isLoading

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen} title="Purchaser Details">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 div">
            <Input
              disabled={disabledInput}
              label="Fullname"
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
