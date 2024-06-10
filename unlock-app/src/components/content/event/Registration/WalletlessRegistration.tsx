import { useClaim } from '~/hooks/useClaim'
import { ethers } from 'ethers'

import ReCaptcha from 'react-google-recaptcha'

import { Button, Input, AddressInput, Modal } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { MintingScreen } from '~/components/interface/checkout/main/Minting'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { TransactionStatus } from '~/components/interface/checkout/main/checkoutMachine'
import { onResolveName } from '~/utils/resolvers'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { MetadataInputType } from '@unlock-protocol/core'
import { useRsvp } from '~/hooks/useRsvp'
import { IoWarningOutline } from 'react-icons/io5'
import { useCaptcha } from '~/hooks/useCaptcha'
import { useMutation } from '@tanstack/react-query'

interface WalletlessRegistrationProps {
  lockAddress: string
  network: number
  handleClose: () => void
  claimResult: any
}

interface FormProps {
  metadataInputs?: MetadataInputType[]
  lockAddress: string
  network: number
  refresh?: () => void
}

const WalletlessRegistrationClaiming = ({
  lockAddress,
  network,
  handleClose,
  claimResult,
}: WalletlessRegistrationProps) => {
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('PROCESSING')

  const config = useConfig()

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

      const transaction = await provider.waitForTransaction(
        claimResult?.hash,
        2
      )

      if (transaction.status !== 1) {
        setTransactionStatus('ERROR')
      } else {
        setTransactionStatus('FINISHED')
      }
    }
    waitForConfirmation()
  }, [transactionStatus, network, claimResult?.hash, config.networks])

  return (
    <div className="bg-white z-10 shadow-xl max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[35rem] max-h-[42rem] p-4">
      <div className="flex">
        {transactionStatus === 'FINISHED' && (
          <p className="mt-10 text-lg font-bold text-center">
            🎉 You have been added to the attendees list!
          </p>
        )}
        <CloseIcon
          className="ml-auto cursor-pointer fill-black group-hover:fill-brand-ui-primary hover:text-brand-ui-primary"
          size={24}
          onClick={() => handleClose()}
        />
      </div>

      {claimResult && transactionStatus && (
        <div className="m-auto mt-20 h-72 mb-36">
          <MintingScreen
            mint={{
              status: transactionStatus,
              transactionHash: claimResult.hash,
            }}
            owner={claimResult.owner}
            lockName={''}
            lockAddress={lockAddress}
            network={network}
            states={{
              PROCESSING: {
                text: 'Creating your ticket...',
              },
              FINISHED: {
                text: 'Successfully created your ticket!',
              },
              ERROR: {
                text: 'Failed to create the ticket.',
              },
            }}
          />
        </div>
      )}
    </div>
  )
}

export const WalletlessRegistrationClaim = ({
  metadataInputs,
  lockAddress,
  network,
  refresh,
}: FormProps) => {
  const [claimResult, setClaimResult] = useState<any>()
  const [isClaimOpen, setClaimOpen] = useState(false)
  const { mutateAsync: claim } = useClaim({
    lockAddress,
    network,
  })

  const onRSVP = async ({
    recipient,
    data,
    captcha,
  }: {
    recipient?: string
    data: any
    captcha: string
  }) => {
    const { hash, owner, message } = await claim({
      recipient,
      metadata: data,
      captcha,
    })
    if (message) {
      ToastHelper.error(message)
    }
    if (hash && owner) {
      setClaimResult({ hash, owner })
      setClaimOpen(true)
      ToastHelper.success('Transaction successfully sent!')
    }
  }

  return (
    <>
      <Modal isOpen={isClaimOpen} setIsOpen={setClaimOpen} empty={true}>
        <WalletlessRegistrationClaiming
          lockAddress={lockAddress}
          network={network}
          handleClose={() => {
            setClaimOpen(false)
            if (refresh) {
              refresh()
            }
          }}
          claimResult={claimResult}
        />
      </Modal>
      <RegistrationForm metadataInputs={metadataInputs} onRSVP={onRSVP} />
    </>
  )
}

export const WalletlessRegistrationApply = ({
  metadataInputs,
  lockAddress,
  network,
}: FormProps) => {
  const { mutateAsync: rsvp } = useRsvp({
    lockAddress,
    network,
  })

  const onRSVP = async ({
    recipient,
    captcha,
    data,
  }: {
    recipient: string
    data: any
    captcha: string
  }) => {
    const result = await rsvp({
      data,
      recipient,
      captcha,
    })
    if (result.message) {
      ToastHelper.error(result.message)
    }
    ToastHelper.success(
      'Application successfully sent! The organizer will contact you if you are accepted!'
    )
  }

  return (
    <>
      <div className="flex rounded-md bg-[#FFF7E8] p-2">
        <IoWarningOutline size="32" className="w-24" />
        <p>
          This event requires approval, once approved you will receive an email
          with your ticket and location details!{' '}
        </p>
      </div>
      <RegistrationForm metadataInputs={metadataInputs} onRSVP={onRSVP} />
    </>
  )
}

export const RegistrationForm = ({
  onRSVP,
  metadataInputs,
}: {
  metadataInputs?: MetadataInputType[]
  onRSVP: ({
    recipient,
    captcha,
    data,
  }: {
    recipient: string
    data: any
    captcha: string
  }) => void
}) => {
  const config = useConfig()
  const { recaptchaRef, getCaptchaValue } = useCaptcha()
  const [loading, setLoading] = useState<boolean>(false)
  const { account } = useAuth()

  const localForm = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      recipient: account || '',
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = localForm

  const handleResolve = useMutation(onResolveName)

  const onSubmit = async ({ recipient, ...data }: any) => {
    setLoading(true)
    try {
      const captcha = await getCaptchaValue()
      await onRSVP({
        recipient,
        data,
        captcha,
      })
      reset(Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: '' }), {}))
    } catch (error: any) {
      console.error(error)
      ToastHelper.error(
        'There was an error during registration. Please try again.'
      )
    }
    setLoading(false)
  }

  const isLoading = loading || handleResolve.isLoading

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-full gap-4"
    >
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />

      {/* TODO: delete me after May 1st 2024 once all new events use `metadataInputs` */}
      {(!metadataInputs || metadataInputs.length === 0) && (
        <>
          <Input
            {...register('email', {
              required: {
                value: true,
                message: 'This field is required.',
              },
            })}
            required
            type="email"
            placeholder="your@email.com"
            label="Email address"
            description={
              'Please enter your email address to get a QR code by email.'
            }
            // @ts-expect-error  Type 'FieldError' is not assignable to type 'string'.
            error={errors?.email?.message}
          />
          <Input
            {...register('fullname', {
              required: {
                value: true,
                message: 'This field is required.',
              },
            })}
            required
            placeholder="Satoshi Nakamoto"
            label="Full Name"
            description={
              'Please enter your your full name to be added to the RSVP list.'
            }
            // @ts-expect-error  Type 'FieldError' is not assignable to type 'string'.
            error={errors?.fullname?.message}
          />
        </>
      )}

      {metadataInputs?.map((metadataInputItem: any) => {
        const {
          name,
          label,
          defaultValue,
          placeholder,
          type,
          required,
          value,
        } = metadataInputItem ?? {}
        const inputLabel = label || name
        return (
          <Input
            key={name}
            label={`${inputLabel}:`}
            autoComplete={inputLabel}
            defaultValue={defaultValue}
            placeholder={placeholder}
            type={type}
            // @ts-expect-error Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'FieldErrors<{ email: string; recipient: string; fullname: string; }>'.
            error={errors[name]?.message}
            {...register(name, {
              required: required && `${inputLabel} is required`,
              value,
            })}
          />
        )
      })}

      <Controller
        name="recipient"
        control={control}
        render={({ field }) => {
          return (
            <AddressInput
              optional
              withIcon
              placeholder="0x..."
              label="Wallet address or ENS"
              description="Enter your address to get the NFT ticket right in your wallet."
              onResolveName={handleResolve.mutateAsync}
              {...field}
            />
          )
        }}
      />

      <Button disabled={isLoading} loading={isLoading} type="submit">
        RSVP now
      </Button>
    </form>
  )
}
