import { z } from 'zod'
import { useClaim } from '~/hooks/useClaim'
import { ethers } from 'ethers'

import ReCaptcha from 'react-google-recaptcha'

import {
  Button,
  Input,
  AddressInput,
  isAddressOrEns,
} from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { MintingScreen } from '~/components/interface/checkout/main/Minting'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { TransactionStatus } from '~/components/interface/checkout/main/checkoutMachine'

// TODO: once we have saved checkout config, use the metadata fields from there.
// In the meantime, use email + wallet address
const rsvpForm = z.object({
  email: z
    .string({
      description: 'Email address that will receive the QR code.',
    })
    .default(''),
  recipient: z
    .string({
      description: 'Wallet that will receive the ticket NFT.',
    })
    .default(''),
})

type RsvpFormProps = z.infer<typeof rsvpForm>

interface WalletlessRegistrationProps {
  lockAddress: string
  network: number
}

export const WalletlessRegistration = ({
  lockAddress,
  network,
}: WalletlessRegistrationProps) => {
  const { account } = useAuth()
  const [claimResult, setClaimResult] = useState<any>()
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('PROCESSING')
  const [loading, setLoading] = useState<boolean>(false)
  const recaptchaRef = useRef<any>()
  const config = useConfig()

  const { mutateAsync: claim } = useClaim({
    lockAddress,
    network,
  })

  const localForm = useForm<RsvpFormProps>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      recipient: account || '',
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = localForm

  const onSubmit = async (form: RsvpFormProps) => {
    setLoading(true)
    try {
      const captcha = await recaptchaRef.current?.executeAsync()
      const { hash, owner } = await claim({
        ...form,
        captcha,
      })
      setClaimResult({ hash, owner })
      ToastHelper.success('Transaction successful sent!')
    } catch (error) {
      console.error(error)
      ToastHelper.error(
        'There was an error during registration. Please try again.'
      )
    }
    setLoading(false)
  }

  const { recipient = '' } = useWatch({
    control,
  })

  useEffect(() => {
    if (
      ['ERROR', 'FINISHED'].includes(transactionStatus as string) ||
      !claimResult?.hash
    ) {
      return
    }
    const waitForConfirmation = async () => {
      const provider = new ethers.providers.JsonRpcBatchProvider(
        config.networks[network].provider
      )

      const transaction = await provider.waitForTransaction(claimResult.hash, 2)

      if (transaction.status !== 1) {
        setTransactionStatus('ERROR')
      } else {
        setTransactionStatus('FINISHED')
      }
    }
    waitForConfirmation()
  }, [transactionStatus, network, claimResult?.hash, config.networks])

  return (
    <>
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      {claimResult && transactionStatus && (
        <div className="h-72 mb-36">
          <MintingScreen
            mint={{
              status: transactionStatus,
              transactionHash: claimResult.hash,
            }}
            account={claimResult.owner}
            lockName={''}
            lockAddress={lockAddress}
            network={network}
          />
          {transactionStatus === 'FINISHED' && (
            <p className="my-16 font-bold text-3xl text-center">
              🎉 You have been added to the attendees list!
            </p>
          )}
        </div>
      )}
      {!claimResult && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full gap-6 py-4"
        >
          <Input
            {...register('email', {
              required: {
                value: true,
                message: 'This field is required.',
              },
            })}
            type="email"
            placeholder="your@email.com"
            label="Email address"
            description={
              'Please enter your email address to get a QR code by email.'
            }
            error={errors?.email?.message}
          />
          <Controller
            name="recipient"
            control={control}
            rules={{
              validate: (address: string) => {
                return !address || isAddressOrEns(address)
              },
            }}
            render={() => {
              return (
                <>
                  <AddressInput
                    value={recipient}
                    withIcon
                    placeholder="0x..."
                    label="Your wallet address (or ENS)"
                    onChange={(value: any) => {
                      setValue('recipient', value)
                    }}
                    description={
                      'You will receive your NFT ticket on this wallet.'
                    }
                  />
                </>
              )
            }}
          />

          <Button disabled={loading} loading={loading} type="submit">
            RSVP
          </Button>
        </form>
      )}
    </>
  )
}
