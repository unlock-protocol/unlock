'use client'

import { Input, Button, Placeholder } from '@unlock-protocol/ui'
import { KeyManager, TransferObject } from '@unlock-protocol/unlock-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { MouseEventHandler, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTransferCode, useTransferDone } from '~/hooks/useTransfer'
import { useConfig } from '~/utils/withConfig'
import { toast } from 'react-hot-toast'
import { AxiosError } from 'axios'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useLockData } from '~/hooks/useLockData'
import { useTransferFee } from '~/hooks/useTransferFee'
import { useQuery } from '@tanstack/react-query'
import { useProvider } from '~/hooks/useProvider'
import { useReCaptcha } from 'next-recaptcha-v3'

interface SendTransferFormProps {
  createTransferCode: ReturnType<typeof useTransferCode>['createTransferCode']
  isLoading: boolean
  onTransferCodeReceived: (
    transferObject: TransferObject & { transferCode: string }
  ) => void
}

const SendTransferForm = ({
  isLoading,
  createTransferCode,
  onTransferCodeReceived,
}: SendTransferFormProps) => {
  const { executeRecaptcha } = useReCaptcha()

  const onTransfer: MouseEventHandler = async (event) => {
    event.preventDefault()
    const captcha = await executeRecaptcha('transfer')
    createTransferCode(
      { captcha },
      {
        onError(error) {
          if (error instanceof AxiosError) {
            if (error.status === 409) {
              return toast.error(
                'Too many requests. Please wait a few minutes before trying again.'
              )
            }
            return toast.error(
              'There was en error while trying to send an authorization code. Please try again!'
            )
          }
        },
        onSuccess(transferObject) {
          onTransferCodeReceived(transferObject)
        },
      }
    )
  }

  return (
    <div className="grid gap-6 p-4 bg-white border rounded-lg">
      <div className="space-y-1">
        <h1 className="text-xl font-bold"> Request transfer code</h1>
        <p className="text-gray-800">
          We will send a transfer code to your email address. You will need to
          use this transfer code to confirm the transaction below. It expires
          within 15 minutes.
        </p>
      </div>
      <div className="flex items-center justify-end">
        <Button loading={isLoading} onClick={onTransfer}>
          Send Transfer Code
        </Button>
      </div>
    </div>
  )
}

interface ConfirmTransferData {
  transferCode: string
}

interface Props {
  transferObject: TransferObject & {
    transferCode: string
  }
  network: number
  onCancel: () => void
}

export const ConfirmTransferForm = ({
  transferObject,
  network,
  onCancel,
}: Props) => {
  const config = useConfig()
  const router = useRouter()
  const web3Service = useWeb3Service()
  const manager = new KeyManager(config.networks)
  const { getWalletService } = useProvider()
  const {
    handleSubmit,
    register,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ConfirmTransferData>({
    reValidateMode: 'onBlur',
  })

  const { lock } = useLockData({
    lockAddress: transferObject.lock,
    network,
  })

  const { transferDone } = useTransferDone()

  const onSubmit = async ({ transferCode }: ConfirmTransferData) => {
    const walletService = await getWalletService(network)
    const signer = walletService.signer

    const transferSignature = [
      '0x',
      Buffer.from(
        [transferCode, transferObject.transferCode].join(''),
        'base64'
      ).toString('hex'),
    ].join('')

    await transferDone(
      {
        ...transferObject,
        transferSignature,
        network,
      },
      {
        onError(error) {
          if (error instanceof AxiosError) {
            if (error.status === 409) {
              return toast.error(
                'Too many requests. Please wait a few minutes before trying again.'
              )
            }
            toast.error(error.message)
          }
        },
      }
    )

    try {
      const total = await web3Service.totalKeys(
        transferObject.lock,
        await signer.getAddress(),
        network
      )
      const maxKeysPerAddress = lock?.maxKeysPerAddress ?? 1

      if (total >= maxKeysPerAddress) {
        toast.error(
          'You already have the maximum number of NFTs for this contract. Please connect with another wallet.'
        )
      } else {
        const tx = await manager.transfer({
          network: network!,
          params: {
            transferSignature,
            deadline: transferObject.deadline,
            lock: transferObject.lock,
            token: transferObject.token,
            owner: transferObject.owner,
          },
          signer,
        })
        await tx.wait()
        // Push to keychain on success
        router.push('/keychain')
      }
    } catch (error: any) {
      console.log(error.message)
      toast.error('Error transferring key. Please try again later.')
    }
  }

  return (
    <div className="grid gap-6 p-4 bg-white border rounded-lg">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Confirm Transfer </h1>
        <p className="text-gray-800">
          Keep this window open and enter the transfer code you received by
          email to confirm the transfer. This code expires in 15 minutes and can
          only be used once from this page. If you do not use the transfer code
          or it expires, you can request a new one and start again. If you have
          any existing NFT membership, it&apos;s user data will be overwritten.
        </p>
      </div>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('transferCode', {
            required: {
              value: true,
              message: 'Transfer code is required.',
            },
            minLength: {
              value: 12,
              message: 'Transfer code is too short.',
            },
          })}
          placeholder="Enter transfer code"
          description="Enter the transfer code you received by email."
          error={errors?.transferCode?.message}
          label="Transfer Code"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-end gap-2">
          <Button variant="outlined-primary" onClick={onCancel}>
            Cancel
          </Button>
          <Button loading={isSubmitting} disabled={!isValid} type="submit">
            Confirm Transfer
          </Button>
        </div>
      </form>
    </div>
  )
}

export const useQueryTransfer = () => {
  const searchParams = useSearchParams()
  return useMemo(() => {
    const lockAddress = searchParams.get('lockAddress')
    const keyId = searchParams.get('keyId')
    const network = searchParams.get('network')
    const transfer = searchParams.get('transfer')
    return {
      lockAddress: lockAddress?.toString(),
      keyId: keyId?.toString(),
      network: Number(network?.toString()),
      transfer: transfer ? JSON.parse(transfer) : undefined,
      isReady: !!lockAddress && !!keyId && !!network,
    }
  }, [searchParams])
}

export const Transfer = () => {
  const { transfer, isReady, ...props } = useQueryTransfer()
  const [transferObject, setTransferObject] = useState<
    (TransferObject & { transferCode: string }) | undefined
  >(transfer)

  const { createTransferCode, isLoading: isLoadingTransferCode } =
    useTransferCode({
      network: props.network!,
      lockAddress: props.lockAddress!,
      keyId: props.keyId!,
    })

  const { getTransferFeeBasisPoints } = useTransferFee({
    network: props.network!,
    lockAddress: props.lockAddress!,
  })

  const {
    isLoading: isLoadingTransferFeeBasisPoints,
    data: transferFeeBasisPoints,
  } = useQuery({
    queryKey: ['getTransferFeeBasisPoints', props.lockAddress!, props.network!],
    queryFn: async () => getTransferFeeBasisPoints(),
  })

  const isLoading = isLoadingTransferCode || isLoadingTransferFeeBasisPoints
  // TODO: check is the key manager is also lock manager
  const transferEnabled = transferFeeBasisPoints !== 10000

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold"> Transfer membership</h1>
        <p className="text-lg text-gray-600">
          Transfer your membership NFT received by email to your own wallet.
        </p>
      </header>
      <main className="grid gap-6">
        {!isReady && <div> Invalid transfer URL </div>}
        {isLoadingTransferFeeBasisPoints && (
          <Placeholder.Root className="p-6 bg-white border rounded-lg">
            <Placeholder.Line size="lg" />
            <Placeholder.Line size="lg" />
            <Placeholder.Line size="lg" />
            <Placeholder.Line size="lg" />
          </Placeholder.Root>
        )}
        {isReady && !isLoadingTransferFeeBasisPoints && (
          <>
            {transferEnabled && (
              <>
                {!transferObject && (
                  <SendTransferForm
                    isLoading={isLoading}
                    createTransferCode={createTransferCode}
                    onTransferCodeReceived={(obj) => {
                      setTransferObject(obj)
                    }}
                  />
                )}
                {transferObject && (
                  <ConfirmTransferForm
                    network={props.network}
                    transferObject={transferObject}
                    onCancel={() => setTransferObject(undefined)}
                  />
                )}
              </>
            )}
            {!transferEnabled && (
              <div className="space-y-1">
                <p className="text-gray-800">
                  Transfers for this contract are currently disabled. Please
                  contact the manager of the contract to transfer your
                  individual membership.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
