import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'

interface WithdrawFundModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  lockAddress: string
  dismiss?: () => void
  balance: number
}

const withdrawForm = z.object({
  balance: z
    .number({
      description: 'Total balance to collect',
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
}: WithdrawFundModalProps) => {
  const walletService = useWalletService()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawFormProps>({
    mode: 'onSubmit',
  })

  const withdrawFromLockPromise = async (): Promise<unknown> => {
    return await walletService.withdrawFromLock({
      lockAddress,
    })
  }

  const withdrawMutation = useMutation(withdrawFromLockPromise)

  const onWithDraw = async (form: WithdrawFormProps) => {
    const promise = withdrawMutation.mutateAsync()
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
          <Input
            label="Address"
            size="small"
            {...register('address', {
              required: true,
              minLength: {
                value: 3,
                message: 'Address should be 3 characters long at least.',
              },
            })}
            error={errors?.address && 'This field is required'}
          />
          <Input
            label="Balance"
            size="small"
            type="numeric"
            step={0.01}
            {...register('balance', {
              required: true,
              min: 0,
              max: balance,
            })}
            error={errors?.balance && 'This field is required'}
          />
          <Button type="submit" className="mt-2">
            Withdraw
          </Button>
        </form>
      </div>
    </Modal>
  )
}
