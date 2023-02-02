import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ethers } from 'ethers'

interface WithdrawFundModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  lockAddress: string
  dismiss?: () => void
  balance: number
}

const withdrawForm = z.object({
  amount: z
    .number({
      description: 'Total amount to collect',
    })
    .default(0),
  address: z
    .string({
      description: 'Recipient for withdraw',
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
}: WithdrawFundModalProps) => {
  const walletService = useWalletService()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawFormProps>({
    mode: 'onSubmit',
  })

  const withdrawFromLockPromise = async (
    form: WithdrawFormProps
  ): Promise<unknown> => {
    const { address: beneficiary } = form ?? {}

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
    const promise = withdrawMutation.mutateAsync(form)

    await ToastHelper.promise(promise, {
      success: 'Withdraw done',
      error: `Withdraw can't be processed, please try again`,
      loading: 'Withdrawing...',
    })
  }

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
            {...register('address', {
              required: {
                value: true,
                message: 'This field is required.',
              },
              minLength: {
                value: 3,
                message: 'Address should be 3 characters long at least.',
              },
            })}
            error={errors?.address?.message}
          />
          <Input
            label="Balance"
            size="small"
            type="numeric"
            step={0.01}
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
