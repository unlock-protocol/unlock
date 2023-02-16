import { AddressInput, Button, Input, Modal } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { z } from 'zod'
import { useMutation, useQueries } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import networks from '@unlock-protocol/networks'
import { useEffect, useState } from 'react'
import { useProvider } from '~/hooks/useProvider'

interface WithdrawFundModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  lockAddress: string
  dismiss?: () => void
  balance: number
  network: number
  symbol?: string
}

const withdrawForm = z.object({
  amount: z
    .number({
      description: 'Total amount to collect',
    })
    .default(0),
  beneficiary: z
    .string({
      description: 'Beneficiary address for withdraw',
    })
    .default(''),
})

type WithdrawFormProps = z.infer<typeof withdrawForm>

const Detail = ({ label, value, ...props }: any) => {
  return (
    <div className="flex flex-col gap-1" {...props}>
      <span className="text-base">{label}</span>
      <span className="text-base font-bold text-black">{value || ''}</span>
    </div>
  )
}

export const WithdrawFundModal = ({
  isOpen,
  setIsOpen,
  lockAddress,
  balance,
  dismiss,
  symbol,
  network,
}: WithdrawFundModalProps) => {
  const web3Service = useWeb3Service()
  const { account, getWalletService } = useAuth()
  const [preview, setPreview] = useState(false)
  const provider = web3Service.providerForNetwork(network)

  const localForm = useForm<WithdrawFormProps>({
    mode: 'onChange',
    defaultValues: {
      amount: 0,
      beneficiary: account,
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    trigger,
  } = localForm

  const withdrawFromLockPromise = async (
    form: WithdrawFormProps
  ): Promise<unknown> => {
    const walletService = await getWalletService(network)
    return await walletService.withdrawFromLock({
      lockAddress,
      beneficiary: account, // todo: replace with custom beneficiary when AddressInput is fixed
      amount: form.amount.toString(),
    })
  }

  const onDismiss = () => {
    setIsOpen(false)
    if (typeof dismiss === 'function') {
      dismiss()
      reset()
    }
  }

  const withdrawMutation = useMutation(withdrawFromLockPromise, {
    onSuccess: () => {
      onDismiss()
    },
    onError: () => {
      onDismiss()
    },
  })

  const onWithDraw = async (form: WithdrawFormProps) => {
    await withdrawMutation.mutateAsync(form, {
      onSuccess: () => {
        ToastHelper.success(`Withdraw done`)
      },
      onError: () => {
        ToastHelper.error(`Withdraw can't be processed, please try again`)
      },
    })
  }

  const amountToTransfer = watch('amount', 0)
  const beneficiary = watch('beneficiary', '')

  const [{ data: isContract }] = useQueries({
    queries: [
      {
        queryKey: ['getCode', lockAddress, network],
        queryFn: async () => {
          try {
            const code = await provider.getCode(beneficiary)
            return code !== '0x' // is a contract address
          } catch (_err) {
            return false
          }
        },
        enabled: beneficiary?.length > 0,
      },
    ],
  })

  console.log('data', isContract)

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex flex-col w-full gap-5">
        <div className="text-left">
          <h3 className="text-xl font-semibold text-left text-black-500">
            {preview ? 'Withdraw details:' : 'Withdraw'}
          </h3>
          {!preview && (
            <span className="text-sm leading-tight text-gray-500">
              Customize the address and the total balance you want to withdraw.
            </span>
          )}
        </div>
        <form className="grid w-full gap-3" onSubmit={handleSubmit(onWithDraw)}>
          {preview ? (
            <>
              <div className="flex flex-col gap-2 leading-tight text-md text-brand-dark">
                <Detail label="Network:" value={networks[network]?.name} />
                <Detail
                  label="Amount to transfer:"
                  value={`${amountToTransfer} ${symbol}`}
                />
                <Detail label="Beneficiary" value={beneficiary} />
                <span className="text-red-500">
                  - This is a contract address, please make sure this contract
                  can handle the funds, or they will be lost
                </span>
              </div>
              <span className="mt-4 text-center">Do you want to proceed?</span>
            </>
          ) : (
            <>
              <AddressInput
                withIcon
                name="beneficiary"
                label="Address"
                size="small"
                localForm={localForm!}
                disabled={withdrawMutation.isLoading}
                web3Service={web3Service}
              />

              <Input
                label={`Balance to transfer: ${amountToTransfer} ${symbol}`}
                size="small"
                type="range"
                min={0}
                max={balance}
                step={balance / 100}
                disabled={withdrawMutation.isLoading}
                {...register('amount', {
                  required: {
                    value: true,
                    message: 'This field is required.',
                  },
                  min: {
                    value: 0,
                    message: 'Min amount should be greater than 0.',
                  },
                  max: {
                    value: balance,
                    message: `Max amount should be less then ${balance}.`,
                  },
                })}
                error={errors?.amount?.message}
              />
            </>
          )}
          {preview ? (
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outlined-primary"
                disabled={withdrawMutation.isLoading}
                onClick={() => {
                  setPreview(false)
                  reset({
                    beneficiary: beneficiary || '',
                    amount: Number(amountToTransfer),
                  })
                }}
                size="medium"
              >
                Edit
              </Button>
              <Button
                type="submit"
                loading={withdrawMutation.isLoading}
                disabled={withdrawMutation.isLoading}
                size="medium"
              >
                {!withdrawMutation.isLoading ? 'Confirm' : 'Withdrawing...'}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={async () => {
                const formValid = await trigger()
                if (formValid) {
                  setPreview(true)
                }
              }}
              size="medium"
            >
              Next
            </Button>
          )}
        </form>
      </div>
    </Modal>
  )
}
