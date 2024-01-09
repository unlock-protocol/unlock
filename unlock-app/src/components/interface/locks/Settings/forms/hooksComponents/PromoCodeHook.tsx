import { Button, Input } from '@unlock-protocol/ui'
import { CustomComponentProps } from '../UpdateHooksForm'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { networks } from '@unlock-protocol/networks'
import { FaTrash as TrashIcon } from 'react-icons/fa'

import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getEthersWalletFromPassword } from '~/utils/strings'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useEffect, useState } from 'react'

export const PromoCodeHook = ({
  lockAddress,
  network,
  hookAddress,
}: CustomComponentProps) => {
  const methods = useFormContext()
  const { getWalletService } = useAuth()

  const { isLoading: isLoading, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      code: '',
      discount: 20,
      cap: 100,
    },
  })

  const savePromoCode = async (code: string, discount: number, cap: number) => {
    // Save the code in lock settings
    const settingsPromoCodes = settings?.promoCodes ?? []
    await saveSettingsMutation({
      lockAddress,
      network,
      promoCodes: [...settingsPromoCodes, code].filter(
        (value, index, array) => array.indexOf(value) === index
      ),
    })
    // Save the code in the hook!
    const walletService = await getWalletService(network)
    const signerAddress = await getEthersWalletFromPassword(code).address
    return walletService.setDiscountCodeWithCapHookSigner({
      lockAddress,
      signerAddress,
      contractAddress: hookAddress,
      network,
      discountPercentage: discount,
      cap,
    })
  }

  const addPromoCode = async () => {
    if (!form.formState.isValid) {
      ToastHelper.error('Make sure all fields are filled out correctly.')
      return false
    }
    await savePromoCode(
      form.getValues('code'),
      form.getValues('discount'),
      form.getValues('cap')
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-2">
        <p>
          With this hook, you can offer promo codes that add discounts to your
          lock contract.
        </p>
        <table>
          <tr className="">
            <td className="pr-4">
              <Input
                error={form.formState.errors.code?.message as string}
                placeholder="FRIENDS20"
                label="Promo code"
                {...form.register('code', {
                  required: true,
                })}
              />
            </td>
            <td className="pr-4">
              <Input
                error={form.formState.errors.discount?.message as string}
                placeholder="20"
                label="Discount (%)"
                {...form.register('discount', {
                  valueAsNumber: true,
                  min: 0,
                  max: 100,
                  required: true,
                })}
              />
            </td>
            <td className="pr-4">
              <Input
                error={form.formState.errors.cap?.message as string}
                placeholder="100"
                label="Number of uses"
                {...form.register('cap', {
                  valueAsNumber: true,
                  min: 0,
                  required: true,
                })}
              />
            </td>
            <td className="pr-4 flex pt-9">
              <Button
                className=""
                disabled={!form.formState.isValid}
                size="small"
                onClick={addPromoCode}
              >
                Add
              </Button>
            </td>
          </tr>

          {isLoading && <span>Loading...</span>}
          {!isLoading &&
            settings?.promoCodes?.map((code) => {
              return (
                <PromoCode
                  savePromoCode={savePromoCode}
                  code={code}
                  key={code}
                  lockAddress={lockAddress}
                  hookAddress={hookAddress}
                  network={network}
                />
              )
            })}
        </table>
      </div>
    </FormProvider>
  )
}

interface PromoCodeProps {
  savePromoCode: (code: string, discount: number, cap: number) => void
  code: string
  lockAddress: string
  network: number
  hookAddress: string
}

export const PromoCode = ({
  savePromoCode,
  code,
  lockAddress,
  hookAddress,
  network,
}: PromoCodeProps) => {
  const [promoCodeDetails, setPromoCodeDetails] = useState<{
    discount: number
    cap: number
    count: number
  } | null>(null)

  // Load the code details from the hook!
  useEffect(() => {
    const getPromoCodeDetails = async () => {
      const web3Service = new Web3Service(networks)
      const signerAddress = await getEthersWalletFromPassword(code).address
      setPromoCodeDetails(
        await web3Service.getDiscountHookWithCapValues({
          lockAddress,
          contractAddress: hookAddress,
          network,
          signerAddress,
        })
      )
    }
    getPromoCodeDetails()
  }, [code, hookAddress, lockAddress, network])

  if (!promoCodeDetails || promoCodeDetails.discount === 0) {
    return null
  }

  return (
    <tr>
      <td className="pl-4">{code}</td>
      <td className="pl-4">{promoCodeDetails.discount / 100}%</td>
      <td className="pl-4">
        {promoCodeDetails.count}/{promoCodeDetails.cap}
      </td>
      <td className="pl-4">
        <TrashIcon
          className="cursor-pointer"
          onClick={() => {
            savePromoCode(code, 0, 0)
          }}
        />
      </td>
    </tr>
  )
}
