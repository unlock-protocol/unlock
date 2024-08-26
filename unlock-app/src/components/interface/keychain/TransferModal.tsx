import { useQuery } from '@tanstack/react-query'
import {
  AddressInput,
  Button,
  Input,
  Modal,
  Placeholder,
} from '@unlock-protocol/ui'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { MAX_UINT } from '~/constants'
import { useAuth } from '~/contexts/AuthenticationContext'
import { onResolveName } from '~/utils/resolvers'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface TransferModalProps {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  network: number
  owner: string
  tokenId: string
  expiration: any
  lock: any
}

interface TransferFormProps {
  recipientAddress: string
  time: number
}

type TransferOption = 'transfer' | 'share' | 'lend' | undefined

const MAX_TRANSFER_FEE = 10000 //100% of transfer fees = disabled transfers

export function TransferModal({
  isOpen,
  setIsOpen,
  lock,
  network,
  owner,
  tokenId,
  expiration,
}: TransferModalProps) {
  const hasNoExpiry = expiration === MAX_UINT

  const { getWalletService } = useAuth()
  const web3service = useWeb3Service()

  const [isLoading, setIsLoading] = useState(false)
  const [option, setOption] = useState<TransferOption>(undefined)

  const maxTransferableSeconds = expiration - Math.floor(Date.now() / 1000)
  const maxTransferableDays = Math.floor(
    maxTransferableSeconds / (60 * 60 * 24)
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TransferFormProps>({
    mode: 'onChange',
    defaultValues: {
      recipientAddress: undefined,
      time: undefined,
    },
  })

  async function fetchTransferFees() {
    let result = await web3service.transferFeeBasisPoints(lock.address, network)
    result = Number(result)
    return result
  }

  const {
    isLoading: pageIsLoading,
    error,
    data: transferFees,
  } = useQuery({
    queryKey: ['transferFees', lock.address, network],
    queryFn: fetchTransferFees,
    enabled: isOpen,
  })

  if (error) {
    console.error(error)
  }

  async function onHandleSubmit(values: TransferFormProps) {
    setIsLoading(true)

    try {
      const walletService = await getWalletService(network)
      let params

      switch (option) {
        case 'transfer':
          params = {
            keyOwner: owner,
            to: values.recipientAddress,
            tokenId: tokenId,
            lockAddress: lock.address,
          }
          await walletService.transferFrom(params)
          break
        case 'share':
          params = {
            lockAddress: lock.address,
            recipient: values.recipientAddress,
            tokenId: tokenId,
            duration: (values.time * 60 * 60 * 24).toString(),
          }
          await walletService.shareKey(params)
          break
        case 'lend':
          params = {
            lockAddress: lock.address,
            from: owner,
            to: values.recipientAddress,
            tokenId: tokenId,
          }
          await walletService.lendKey(params)
          break
        default:
          break
      }
      ToastHelper.success('Key transfer successful!')
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
    } finally {
      setIsLoading(false)
      setOption(undefined)
    }
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <h3 className="text-xl font-bold text-center">Transfer Key</h3>

      {pageIsLoading ? (
        <Placeholder.Root>
          <Placeholder.Image className="h-[200px] w-[400px]" />
        </Placeholder.Root>
      ) : transferFees === MAX_TRANSFER_FEE ? (
        <div className="h-[200px] w-[400px] flex justify-center items-center">
          <p>This membership is not transferable.</p>
        </div>
      ) : (
        <form
          className="p-6 flex flex-col gap-8 min-w-[300px] max-w-[700px]"
          onSubmit={handleSubmit(onHandleSubmit)}
        >
          <div className="relative gap-3">
            <Controller
              {...register('recipientAddress', {
                required: true,
              })}
              control={control}
              render={({ field }) => {
                return (
                  <AddressInput
                    placeholder="Address or ENS"
                    onResolveName={onResolveName}
                    {...field}
                  />
                )
              }}
            />
            {errors?.recipientAddress && (
              <span className="absolute text-xs text-red-700">
                Address is required.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-bold">Transfer membership</h2>
            <p>
              Transfer your membership. Select{' '}
              <strong>Share membership time</strong> below to only transfer a
              fraction of your membership time.
            </p>
            <Button
              type="submit"
              onClick={() => setOption('transfer')}
              className="w-full"
              loading={isLoading && option === 'transfer'}
            >
              Transfer
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block px-1 text-base font-bold">
              Share membership time
            </label>
            <p>Share only a fraction of your membership time.</p>
            {hasNoExpiry ? (
              <p>Memberships that do not expire cannot be shared.</p>
            ) : (
              <p>Time remaining: {maxTransferableDays} days</p>
            )}
            <Input
              type="number"
              autoComplete="off"
              placeholder="Time in days"
              disabled={hasNoExpiry}
              {...register('time', {
                min: 1,
                max: maxTransferableDays,
                required: option === 'share',
              })}
            />
            {errors?.time && (
              <span className="text-xs text-red-700">
                Value must be between 0 and {maxTransferableDays} days.
              </span>
            )}
            <Button
              type="submit"
              disabled={hasNoExpiry}
              onClick={() => setOption('share')}
              className="w-full"
              loading={isLoading && option === 'share'}
            >
              Share
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center font-bold">Lend Key</label>
            <p>
              Once the key is transferred, the recipient will not be able to
              transfer the key themselves. You can unlend it anytime.
            </p>
            <Button
              type="submit"
              onClick={() => setOption('lend')}
              className="w-full"
              loading={isLoading && option === 'lend'}
            >
              Lend
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
