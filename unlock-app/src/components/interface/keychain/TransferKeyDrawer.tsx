import {
  AddressInput,
  Button,
  Drawer,
  isAddressOrEns,
} from '@unlock-protocol/ui'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { onResolveName } from '~/utils/resolvers'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'
import { useWalletService } from '~/utils/withWalletService'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { addressMinify } from '~/utils/strings'
import { useMutation } from '@tanstack/react-query'
import { useLockData } from '~/hooks/useLockData'
import { useGetTransferFeeBasisPoints } from '~/hooks/useTransferFee'

interface TransferKeyDrawerProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  lockAddress: string
  network: number
  tokenId: string
  owner: string
  lockName?: string
}

const TransferKeyForm = z.object({
  newOwner: z.string({
    description: 'Address of the new owner.',
  }),
})

type TransferKeyFormProps = z.infer<typeof TransferKeyForm>

export const TransferKeyDrawer = ({
  isOpen,
  setIsOpen,
  lockAddress,
  network,
  tokenId,
  owner,
  lockName,
}: TransferKeyDrawerProps) => {
  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferKeyFormProps>({
    defaultValues: {
      newOwner: '',
    },
  })

  const { account } = useAuth()
  const web3Service = useWeb3Service()
  const walletService = useWalletService()
  const newOwner = watch('newOwner', '')

  const { lock } = useLockData({
    lockAddress,
    network,
  })

  const { data: { transferFeePercentage, isTransferAllowed } = {} } =
    useGetTransferFeeBasisPoints({
      lockAddress,
      network,
    })

  console.table({
    transferFeePercentage,
    isTransferAllowed,
  })

  const maxKeysPerAddress = lock?.maxKeysPerAddress ?? 1

  const onTransferFrom = async () => {
    await walletService.transferFrom({
      keyOwner: account!,
      to: newOwner!,
      lockAddress,
      tokenId,
    })
  }

  const transferFromMutation = useMutation(onTransferFrom)

  const onTransferKeyOwnership = async () => {
    const transferPromise = transferFromMutation.mutateAsync()

    await ToastHelper.promise(transferPromise, {
      loading: `Transferring key ownership to ${addressMinify(newOwner)}.`,
      success: 'Key successfully transferred.',
      error: 'There is an issue with transfer, please try again.',
    })
    setIsOpen(false)
  }

  const isOwnerUnchanged = async (address: string) => {
    return owner?.toLowerCase() === address?.toLowerCase()
      ? 'This address is already the current owner for this key.'
      : true
  }

  const hasMaxNumberOfKeys = async () => {
    if (ethers.utils.isAddress(newOwner) && !!lockAddress) {
      const total = await web3Service.totalKeys(lockAddress, newOwner, network)

      return maxKeysPerAddress <= total
        ? 'This address already owns max number of keys.'
        : true
    }
    return true
  }

  const isTransferable = async () => {
    return !isTransferAllowed
      ? 'Transfers are disabled and tokens are soul-bound.'
      : true
  }

  if (!isOpen) return null

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <form
        onSubmit={handleSubmit(onTransferKeyOwnership)}
        className="grid gap-4"
      >
        <div className="grid gap-1">
          <h1 className="text-xl font-bold">{`Transfer key ownership for "${lockName}" (#${tokenId})`}</h1>
          <span>Transfer key allow you to change the owner of a key</span>
        </div>

        <Controller
          name="newOwner"
          control={control}
          rules={{
            required: true,
            validate: {
              isAddressOrEns,
              isOwnerUnchanged,
              hasMaxNumberOfKeys,
              isTransferable,
            },
          }}
          render={() => {
            return (
              <AddressInput
                label="New Owner"
                value={newOwner}
                disabled={transferFromMutation.isLoading}
                onChange={(value: any) => {
                  setValue('newOwner', value, {
                    shouldValidate: true,
                  })
                }}
                error={errors?.newOwner?.message}
                onResolveName={onResolveName}
              />
            )
          }}
        />

        <Button disabled={transferFromMutation.isLoading}>Transfer</Button>
      </form>
    </Drawer>
  )
}
