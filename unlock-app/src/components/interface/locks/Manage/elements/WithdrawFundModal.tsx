import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useAuth } from '~/contexts/AuthenticationContext'

interface WithdrawFundModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  lockAddress: string
  dismiss?: () => void
  balance: number
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

export const WithdrawFundModal = ({
  isOpen,
  setIsOpen,
  lockAddress,
  balance,
  dismiss,
  symbol,
}: WithdrawFundModalProps) => {
  const walletService = useWalletService()
  const { account } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WithdrawFormProps>({
    mode: 'onChange',
    defaultValues: {
      beneficiary: account,
    },
  })

  const withdrawFromLockPromise = async (
    form: WithdrawFormProps
  ): Promise<unknown> => {
    const { beneficiary } = form ?? {}

    if (ethers.utils.isAddress(beneficiary)) {
      return await walletService.withdrawFromLock({
        lockAddress,
        beneficiary,
        amount: form.amount.toString(),
      })
    }
  }

  const onDismiss = () => {
    setIsOpen(false)
    if (typeof dismiss === 'function') {
      dismiss()
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

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex flex-col w-full gap-5">
        <div className="text-left">
          <h3 className="text-xl font-semibold text-left text-black-500">
            Withdraw
          </h3>
          <span className="text-sm leading-tight text-gray-500">
            Customize the address and the total balance you want to withdraw.
          </span>
        </div>
        <form className="grid gap-3" onSubmit={handleSubmit(onWithDraw)}>
          {/* todo: replace with AddressInput component when ready */}
          <Input
            label="Address"
            size="small"
            {...register('beneficiary', {
              required: {
                value: true,
                message: 'This field is required.',
              },
              minLength: {
                value: 3,
                message:
                  'Beneficiary address should be 3 characters long at least.',
              },
            })}
            disabled={withdrawMutation.isLoading}
            error={errors?.beneficiary?.message}
          />
          <Input
            label={`Balance to transfer: ${amountToTransfer} ${symbol}`}
            size="small"
            type="range"
            min={0}
            max={balance}
            step={0.001}
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
          <Button
            type="submit"
            className="mt-2"
            loading={withdrawMutation.isLoading}
            disabled={withdrawMutation.isLoading}
          >
            {!withdrawMutation.isLoading ? 'Withdraw' : 'Withdrawing...'}
          </Button>
        </form>
      </div>
    </Modal>
  )
}
