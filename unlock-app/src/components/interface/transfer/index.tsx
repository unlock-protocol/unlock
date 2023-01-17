import { Input, Button } from '@unlock-protocol/ui'
import { KeyManager, TransferObject } from '@unlock-protocol/unlock-js'
import { useRouter } from 'next/router'
import { MouseEventHandler, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useTransferCode } from '~/hooks/transfer'
import { useConfig } from '~/utils/withConfig'
import { useWalletService } from '~/utils/withWalletService'
import ReCaptcha from 'react-google-recaptcha'

interface SendTransferFormProps {
  lockAddress: string
  keyId: string
  network: number
  onTransferCodeCreated: (transfer: TransferObject) => void
}

export const SendTransferForm = ({
  onTransferCodeCreated,
  lockAddress,
  keyId,
  network,
}: SendTransferFormProps) => {
  const config = useConfig()
  const { createTransferCode, isLoading } = useTransferCode({
    network,
    lockAddress,
    keyId,
    onTransferCodeCreated,
  })

  const recaptchaRef = useRef<any>()

  const onTransfer: MouseEventHandler = async (event) => {
    event.preventDefault()
    const captcha = await recaptchaRef.current?.executeAsync()
    await createTransferCode({ captcha })
  }

  return (
    <div className="grid gap-6 p-4 bg-white border rounded-lg">
      <div className="space-y-1">
        <h1 className="text-xl font-bold"> Request transfer code</h1>
        <p className="text-gray-800">
          You will be sent a transfer code by email. You can use this transfer
          code to initiate the transfer. This code will expire in 15 minutes and
          can only be used once on this page.
        </p>
      </div>
      <div className="flex items-center justify-end">
        <ReCaptcha
          ref={recaptchaRef}
          sitekey={config.recaptchaKey}
          size="invisible"
          badge="bottomleft"
        />
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
}

export const ConfirmTransferForm = ({ transferObject }: Props) => {
  const config = useConfig()
  const walletService = useWalletService()
  const manager = new KeyManager(config.networks)
  const { network } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ConfirmTransferData>({
    reValidateMode: 'onChange',
  })

  const onSubmit = async ({ transferCode: part1 }: ConfirmTransferData) => {
    const signer = walletService.signer
    const transferSignature = [
      '0x',
      Buffer.from(
        [part1, transferObject.transferCode].join(''),
        'base64'
      ).toString('hex'),
    ].join('')

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
  }

  return (
    <div className="grid gap-6 p-4 bg-white border rounded-lg">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Confirm Transfer </h1>
        <p className="text-gray-800">
          Enter the transfer code you received by email to confirm the transfer.
          This code will expire in 15 minutes and can only be used once on this
          page. If you do not use the transfer code or it expires, you will need
          to request a new one.
        </p>
      </div>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('transferCode', {
            required: {
              value: true,
              message: 'Code is required.',
            },
            minLength: {
              value: 12,
              message: 'Code must be at least 12 characters.',
            },
          })}
          placeholder="Enter transfer code"
          description="Enter the transfer code you received by email."
          error={errors?.transferCode?.message}
          label="Transfer Code"
        />
        <div className="flex items-center justify-end">
          <Button disabled={!isValid} type="submit">
            Confirm Transfer
          </Button>
        </div>
      </form>
    </div>
  )
}

export const useQueryTransfer = () => {
  const router = useRouter()
  const result = useMemo(() => {
    const { lockAddress, keyId, network, transfer } = router.query
    return {
      lockAddress: lockAddress?.toString(),
      keyId: keyId?.toString(),
      network: Number(network?.toString()),
      transfer: transfer ? JSON.parse(transfer.toString()) : undefined,
      isReady: !!lockAddress && !!keyId && !!network,
    }
  }, [router.query])
  return result
}

export const Transfer = () => {
  const { transfer, isReady, ...props } = useQueryTransfer()
  const [transferObject, setTransferObject] = useState<
    (TransferObject & { transferCode: string }) | undefined
  >(transfer)

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
        {isReady && !transferObject && (
          <SendTransferForm
            onTransferCodeCreated={(obj) => {
              setTransferObject(obj)
            }}
            lockAddress={props.lockAddress!}
            keyId={props.keyId!}
            network={props.network!}
          />
        )}
        {transferObject && (
          <ConfirmTransferForm transferObject={transferObject} />
        )}
      </main>
    </div>
  )
}
