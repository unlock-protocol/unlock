import { useClaim } from '~/hooks/useClaim'
import { ethers } from 'ethers'

import { Button, Input, AddressInput, Checkbox } from '@unlock-protocol/ui'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { MintingScreen } from '~/components/interface/checkout/main/Minting'
import { ToastHelper } from '@unlock-protocol/ui'
import { TransactionStatus } from '~/components/interface/checkout/main/checkoutMachine'
import { onResolveName } from '~/utils/resolvers'
import { MetadataInputType } from '@unlock-protocol/core'
import { useRsvp } from '~/hooks/useRsvp'
import { useReCaptcha } from 'next-recaptcha-v3'
import { useMutation } from '@tanstack/react-query'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import Link from 'next/link'
import { config } from '~/config/app'
import { useWeb3Service } from '~/utils/withWeb3Service'

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
  const [tokenId, setTokenId] = useState<string | null>(null)
  const config = useConfig()
  const web3Service = useWeb3Service()

  // Wait for token ID
  const waitForTokenId = async (owner: string): Promise<string | null> => {
    try {
      const latestTokenId = await web3Service.latestTokenOfOwner(
        lockAddress,
        owner,
        network
      )

      if (latestTokenId) {
        return latestTokenId.toString()
      }

      // If no token found, we'll retry in a second
      return new Promise((resolve) => {
        setTimeout(async () => {
          resolve(await waitForTokenId(owner))
        }, 1000)
      })
    } catch (error) {
      console.error('Error fetching token ID:', error)
      return null
    }
  }

  useEffect(() => {
    if (
      ['ERROR', 'FINISHED'].includes(transactionStatus as string) ||
      !claimResult?.hash
    ) {
      return
    }

    const waitForConfirmation = async () => {
      const provider = new ethers.JsonRpcProvider(
        config.networks[network].provider
      )

      const transaction = await provider.waitForTransaction(
        claimResult?.hash,
        2
      )

      if (!transaction || transaction.status !== 1) {
        setTransactionStatus('ERROR')
      } else {
        setTransactionStatus('FINISHED')
        ToastHelper.success('🎉 You have been added to the attendees list!')

        // After successful transaction, fetch the tokenId
        if (claimResult.owner) {
          const newTokenId = await waitForTokenId(claimResult.owner)
          if (newTokenId) {
            setTokenId(newTokenId)
          }
        }
      }
    }
    waitForConfirmation()
  }, [
    transactionStatus,
    network,
    claimResult?.hash,
    claimResult?.owner,
    config.networks,
    lockAddress,
    web3Service,
  ])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {claimResult && transactionStatus && (
        <div className="w-full">
          <MintingScreen
            isCompact={true}
            mint={{
              network: network,
              status: transactionStatus,
              transactionHash: claimResult.hash,
            }}
            owner={claimResult.owner}
            lockName={''}
            lockAddress={lockAddress}
            network={network}
            tokenId={tokenId}
            states={{
              PROCESSING: {
                text: 'Creating your ticket...',
              },
              FINISHED: {
                text: '🎉 You have been added to the attendees list!',
              },
              ERROR: {
                text: 'Failed to create the ticket.',
              },
            }}
          />
        </div>
      )}
      {transactionStatus === 'FINISHED' && (
        <Button onClick={handleClose} className="mt-4" size="small">
          Close
        </Button>
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
  const [isClaiming, setIsClaiming] = useState(false)
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
    try {
      const { hash, owner, message } = await claim({
        recipient,
        metadata: data,
        captcha,
      })

      if (message) {
        ToastHelper.error(message)
        return
      }
      if (hash && owner) {
        setClaimResult({ hash, owner })
        setIsClaiming(true)
        ToastHelper.success('Transaction successfully sent!')
      }
    } catch (error) {
      console.error(error)
      ToastHelper.error('Failed to send transaction. Please try again.')
    }
  }

  const handleClose = () => {
    setIsClaiming(false)
    setClaimResult(undefined)
    if (refresh) {
      refresh()
    }
  }

  return (
    <div className="relative">
      {isClaiming ? (
        <div className="bg-white rounded-xl flex flex-col w-full p-4">
          <WalletlessRegistrationClaiming
            lockAddress={lockAddress}
            network={network}
            handleClose={handleClose}
            claimResult={claimResult}
          />
        </div>
      ) : (
        <RegistrationForm metadataInputs={metadataInputs} onRSVP={onRSVP} />
      )}
    </div>
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

  return <RegistrationForm metadataInputs={metadataInputs} onRSVP={onRSVP} />
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
  const { executeRecaptcha } = useReCaptcha()

  const [loading, setLoading] = useState<boolean>(false)
  const { account, email } = useAuthenticate()

  // If there is an email, we pre-fill the email field
  if (email) {
    metadataInputs?.map((input) => {
      if (input.name === 'email') {
        input.defaultValue = email
      }
    })
  }

  const localForm = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      recipient: account || '',
      termsAccepted: false,
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = localForm

  const handleResolve = useMutation({
    mutationFn: onResolveName,
  })

  const termsAccepted = watch('termsAccepted')

  const onSubmit = async ({ recipient, termsAccepted, ...data }: any) => {
    setLoading(true)
    try {
      const captcha = await executeRecaptcha('submit')
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

  const isLoading = loading || handleResolve.isPending

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-full gap-4"
    >
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

        // Handle checkbox type
        if (type === 'checkbox') {
          return (
            <Controller
              key={name}
              name={name}
              control={control}
              rules={{
                required: required && `${inputLabel} is required`,
              }}
              defaultValue={defaultValue === 'true' ? 'true' : 'false'}
              render={({ field }) => (
                <Checkbox
                  label={`${inputLabel}`}
                  fieldSize="medium"
                  disabled={isLoading}
                  error={errors[name]?.message?.toString()}
                  checked={field.value === 'true'}
                  onChange={(e) =>
                    field.onChange(e.target.checked ? 'true' : 'false')
                  }
                />
              )}
            />
          )
        }

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

      <div className="mt-2">
        <Controller
          name="termsAccepted"
          control={control}
          rules={{
            required: 'You must agree to the Terms of Service to continue',
          }}
          render={({ field: { onChange, value, ref } }) => (
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Checkbox
                  ref={ref}
                  id="termsAccepted"
                  checked={value}
                  onChange={onChange}
                  label=""
                />
              </div>
              <div className="text-sm">
                <label htmlFor="termsAccepted" className="cursor-pointer">
                  I agree to the{' '}
                  <Link
                    target="_blank"
                    href={`${config.unlockStaticUrl}/terms`}
                    className="text-brand-ui-primary hover:underline"
                  >
                    Terms of Service
                  </Link>
                </label>
              </div>
            </div>
          )}
        />
        {errors.termsAccepted && (
          <p className="mt-1 text-xs text-red-500">
            {errors.termsAccepted.message?.toString()}
          </p>
        )}
      </div>

      <Button
        disabled={isLoading || !termsAccepted}
        loading={isLoading}
        type="submit"
      >
        RSVP now
      </Button>
    </form>
  )
}
