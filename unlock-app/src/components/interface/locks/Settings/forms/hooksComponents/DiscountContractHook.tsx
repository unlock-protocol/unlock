import { Button, Input } from '@unlock-protocol/ui'
import { CustomComponentProps, getSignatureForValue } from '../UpdateHooksForm'
import { ChangeEvent, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useForm } from 'react-hook-form'
import { ConnectForm } from '../../../CheckoutUrl/elements/DynamicForm'

export const DiscountContractHook = ({
  name,
  disabled,
  lockAddress,
  network,
  hookAddress,
}: CustomComponentProps) => {
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()
  const [discountCode, setDiscountCode] = useState('')
  const [signer, setSigner] = useState('')
  const [hasDiscountCode, setHasDiscountCode] = useState(false)
  const {
    register,
    formState: { errors },
    watch,
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      discountCode: '',
      discountPercentage: undefined,
    },
  })

  const discountPercentage = watch('discountPercentage')

  const getDiscounts = async () => {
    const walletService = await getWalletService(network)
    return await web3Service.getDiscountHookValues(
      {
        lockAddress,
        contractAddress: hookAddress,
        network,
        signerAddress: signer,
      },
      walletService.signer
    )
  }

  const { data: discount = 0 } = useQuery(
    ['getDiscounts', lockAddress, network, signer],
    async () => {
      return getDiscounts()
    },
    {
      onSuccess: (discount: number | string) => {
        setHasDiscountCode(Number(discount) > 0)
      },
    }
  )

  const onSaveDiscountCode = async () => {
    const walletService = await getWalletService(network)
    const tx = await walletService.setDiscountCodeHookSigner(
      {
        lockAddress,
        contractAddress: hookAddress,
        signerAddress: signer,
        network,
        discountPercentage: discountPercentage ?? 0,
      },
      walletService.signer
    )
    return tx.wait()
  }

  const onDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value
    const signature = getSignatureForValue(value)
    setDiscountCode(value)
    setSigner(signature)
  }

  const saveDiscountMutation = useMutation(onSaveDiscountCode)

  const handleSaveDiscountCode = async () => {
    const isValid = await trigger()

    if (!isValid) return // form is not valid

    const promise = saveDiscountMutation.mutateAsync()

    await ToastHelper.promise(promise, {
      loading: 'Saving discount code...',
      success: 'Discount code is set for the lock.',
      error: 'There is an issue with discount code update.',
    })
  }

  const disableInput =
    disabled ||
    saveDiscountMutation.isLoading ||
    discountCode.length === 0 ||
    !discountPercentage

  return (
    <ConnectForm>
      {({ getValues, setValue }: any) => {
        const value = getValues(name)
        return (
          <div className="flex flex-col gap-2">
            <Input
              label="Discount code"
              type="text"
              {...register('discountCode')}
              onChange={onDiscountChange}
              description={
                hasDiscountCode && (
                  <span className="font-semibold text-brand-ui-primary">
                    This promo code already have a value set of{' '}
                    {Number(discount) / 100}%
                  </span>
                )
              }
            />
            <Input
              label="Discount percentage (%)"
              type="number"
              step="any"
              {...register('discountPercentage', {
                max: {
                  value: 100,
                  message: 'Max value allowed is 100.',
                },
                min: {
                  value: 0,
                  message: 'Min value allowed is 0.',
                },
              })}
              error={errors?.discountPercentage?.message}
            />
            <div className="ml-auto">
              <Button
                type="button"
                onClick={async () => {
                  await handleSaveDiscountCode()
                  setValue(name, value)
                }}
                size="small"
                disabled={disableInput}
              >
                {hasDiscountCode
                  ? 'Update discount code'
                  : 'Save discount code'}
              </Button>
            </div>
          </div>
        )
      }}
    </ConnectForm>
  )
}
