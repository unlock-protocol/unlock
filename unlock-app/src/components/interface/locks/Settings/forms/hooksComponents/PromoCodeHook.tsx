import { Button, Input } from '@unlock-protocol/ui'
import { CustomComponentProps } from '../UpdateHooksForm'
import { FormProvider, useForm } from 'react-hook-form'

import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'

export const PromoCodeHook = ({
  lockAddress,
  network,
}: CustomComponentProps) => {
  const { isLoading: isLoading, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  console.log({ settings })

  const { register, handleSubmit } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const addNewDiscountCode = async (args) => {
    console.log(args)
    return false
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-2">
        <p>
          With this hook, you can offer promo codes that add discounts to your
          lock contract.
        </p>
        {isLoading && <span>Loading...</span>}
        {!isLoading && (
          <form onSubmit={handleSubmit(addNewDiscountCode)}>
            <table>
              <tbody>
                <tr className="">
                  <td className="pr-4">
                    <Input
                      placeholder="FRIENDS20"
                      label="Promo code"
                      {...register('code')}
                    />
                  </td>
                  <td className="pr-4">
                    <Input
                      placeholder="20"
                      label="Discount (%)"
                      {...register('discount')}
                    />
                  </td>
                  <td className="pr-4">
                    <Input
                      placeholder="100"
                      label="Number of uses"
                      {...register('cap')}
                    />
                  </td>
                  <td className="pr-4 h-full flex">
                    <Button size="small" type="submit">
                      Add
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="pl-1">FRIENDS</td>
                  <td className="pl-1">10%</td>
                  <td className="pl-1">3/1000</td>
                  <td className="pl-1">Edit/Delete</td>
                </tr>
                <tr>
                  <td className="pl-1">FAMILY</td>
                  <td className="pl-1">40%</td>
                  <td className="pl-1">56/100</td>
                  <td className="pl-1">Edit/Delete</td>
                </tr>
              </tbody>
            </table>
          </form>
        )}
      </div>
    </FormProvider>
  )
}
