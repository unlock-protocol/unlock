import { Button, Input } from '@unlock-protocol/ui'
import { ConnectForm } from '../../../CheckoutUrl/elements/DynamicForm'
import { CustomComponentProps, getSignatureForValue } from '../UpdateHooksForm'
import { ChangeEvent, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ToastHelper } from '~/components/helpers/toast.helper'

export const DiscountContractHook = ({
  name,
  disabled,
  lockAddress,
  network,
  address,
}: CustomComponentProps) => {
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()
  const [discountCode, setDiscountCode] = useState('')
  const [signer, setSigner] = useState('')
  const [hasDiscountCode, setHadDiscountCode] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState<
    number | undefined
  >(undefined)

  const getDiscounts = async () => {
    const walletService = await getWalletService(network)
    return await web3Service.getDiscountHookValues(
      {
        lockAddress,
        contractAddress: address,
        network,
        signerAddress: signer,
      },
      walletService.signer
    )
  }

  const { data: discount = 0, isLoading } = useQuery(
    ['getDiscounts', lockAddress, network, signer],
    async () => {
      return getDiscounts()
    },
    {
      onSuccess: (discount: number | string) => {
        setHadDiscountCode(Number(discount) > 0)
      },
    }
  )

  console.log('hasDiscountCode', hasDiscountCode, isLoading)

  const onSaveDiscountCode = async () => {
    const walletService = await getWalletService(network)
    const tx = await walletService.setDiscountCodeHookSigner(
      {
        lockAddress,
        contractAddress: address,
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
              value={discountCode}
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
              label="Discount percentage"
              type="number"
              value={discountPercentage}
              min={0}
              max={100}
              step={0.01}
              onChange={(e) => {
                setDiscountPercentage(parseFloat(e?.target?.value))
              }}
            />
            <div className="ml-auto">
              <Button
                type="button"
                size="small"
                disabled={disableInput}
                onClick={async () => {
                  await handleSaveDiscountCode()
                  setValue(name, value)
                }}
              >
                Save discount code
              </Button>
            </div>
          </div>
        )
      }}
    </ConnectForm>
  )
}
