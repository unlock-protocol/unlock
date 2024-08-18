import { Button, Input, Modal, Placeholder } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
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

interface params {
  keyOwner: string
  to: string
  tokenId: string
  lockAddress: string
  time?: number
  lend?: boolean
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
  const { getWalletService } = useAuth()
  const web3service = useWeb3Service()

  const [isLoading, setIsLoading] = useState(false)
  const [option, setOption] = useState<TransferOption>(undefined)
  const [transferFees, setTransferFees] = useState<number | null>(null)

  const maxTransferableSeconds = expiration - Math.floor(Date.now() / 1000)
  const maxTransferableDays = Math.floor(
    maxTransferableSeconds / (60 * 60 * 24)
  )

  useEffect(() => {
    if (isOpen) fetchTransferFees()
  }, [isOpen])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferFormProps>({
    mode: 'onChange',
    defaultValues: {
      recipientAddress: undefined,
      time: undefined,
    },
  })

  async function fetchTransferFees() {
    setIsLoading(true)
    try {
      let result = await web3service.transferFeeBasisPoints(
        lock.address,
        network
      )
      result = Number(result)
      setTransferFees(result)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onHandleSubmit(values: TransferFormProps) {
    console.log('vals', values)
    setIsLoading(true)

    const params: params = {
      keyOwner: owner,
      to: values.recipientAddress,
      tokenId: tokenId,
      lockAddress: lock.address,
    }

    switch (option) {
      case 'transfer':
        break
      case 'share':
        params.time = values.time * 60 * 60 * 24
        break
      case 'lend':
        params.lend = true
        break
      default:
        break
    }

    try {
      const walletService = await getWalletService(network)
      await walletService.transferFrom(params)
      ToastHelper.success('Key transfer successful!')
    } catch (error) {
      console.error(error)
      ToastHelper.error('Could not transfer key')
    } finally {
      setIsLoading(false)
      setOption(undefined)
    }
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <h3 className="text-xl font-bold text-center">Transfer Key</h3>

      {isLoading && option === undefined ? (
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
            <Input
              label="Recipient address:"
              autoComplete="off"
              placeholder=""
              {...register('recipientAddress', {
                required: true,
              })}
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
            <p>Time remaining: {maxTransferableDays} days</p>
            <Input
              type="number"
              autoComplete="off"
              placeholder="Time in days"
              {...register('time', {
                min: 0,
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
              transfer the key themselves.
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
