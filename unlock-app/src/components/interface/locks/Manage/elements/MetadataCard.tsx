import { Button, Badge, Input, Modal } from '@unlock-protocol/ui'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { FaCheckCircle as CheckIcon } from 'react-icons/fa'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useLockManager } from '~/hooks/useLockManager'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { LoadingIcon } from '../../../Loading'
import { ethers } from 'ethers'
import { MAX_UINT, UNLIMITED_RENEWAL_LIMIT } from '~/constants'
import { durationAsText } from '~/utils/durations'

interface DetailProps {
  label: string
  children?: React.ReactNode
  append?: React.ReactNode
}

interface MetadataCardProps {
  metadata: any
  owner: string
  network: number
  expirationDuration?: string
}

const keysToIgnore = [
  'token',
  'lockName',
  'expiration',
  'keyholderAddress',
  'lockAddress',
  'checkedInAt',
]

const MetadataDetail = ({ label, children, append }: DetailProps) => {
  return (
    <div className="gap-1 pb-2 border-b border-gray-400 last-of-type:border-none">
      <div className="flex items-center gap-2">
        <span className="text-base">{label}: </span>
        <div className="flex items-center gap-2">
          <span className="block text-base font-bold break-words md:inline-block">
            {children}
          </span>
          {append && <div>{append}</div>}
        </div>
      </div>
    </div>
  )
}

interface KeyRenewalProps {
  possibleRenewals: string
  approvedRenewals: string
  balance: Record<'amount' | 'symbol', string>
}

const MembershipRenewal = ({
  possibleRenewals,
  approvedRenewals,
  balance,
}: KeyRenewalProps) => {
  const possible = ethers.BigNumber.from(possibleRenewals)
  const approved = ethers.BigNumber.from(approvedRenewals)

  if (possible.lte(0)) {
    return (
      <MetadataDetail label="Renewals">
        User balance of {balance.amount} {balance.symbol} is too low to renew
      </MetadataDetail>
    )
  }

  if (approved.lte(0)) {
    return (
      <MetadataDetail label="Renewals">No renewals approved</MetadataDetail>
    )
  }

  if (approved.gt(0) && approved.lte(UNLIMITED_RENEWAL_LIMIT)) {
    return (
      <MetadataDetail label="Renewals">
        {approved.toString()} times
      </MetadataDetail>
    )
  }

  if (approved.gt(UNLIMITED_RENEWAL_LIMIT)) {
    return (
      <MetadataDetail label="Renewals">Renews unlimited times</MetadataDetail>
    )
  }

  return <MetadataDetail label="Renewals">-</MetadataDetail>
}

export const MetadataCard = ({
  metadata,
  owner,
  network,
  expirationDuration,
}: MetadataCardProps) => {
  const { account } = useAuth()
  const storageService = useStorageService()
  const walletService = useWalletService()
  const [data, setData] = useState(metadata)
  const [addEmailModalOpen, setAddEmailModalOpen] = useState(false)
  const [checkInTimestamp, setCheckedInTimestamp] = useState<string | null>(
    null
  )
  const items = Object.entries(data || {}).filter(([key]) => {
    return !keysToIgnore.includes(key)
  })

  const { lockAddress, token: tokenId } = data ?? {}

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  const getCheckInTime = () => {
    const [_, checkInTimeValue] =
      Object.entries(metadata)?.find(([key]) => key === 'checkedInAt') ?? []
    if (checkInTimestamp) return checkInTimestamp
    if (!checkInTimeValue) return null
    return new Date(checkInTimeValue as number).toLocaleString()
  }

  const { data: subscription, isLoading: isSubscriptionLoading } = useQuery(
    ['subscription', lockAddress, tokenId, network],
    async () => {
      const response = await storageService.getSubscription({
        lockAddress,
        network,
        keyId: tokenId,
      })
      return response.subscriptions?.[0] ?? null
    },
    {
      onError(error) {
        console.error(error)
      },
    }
  )

  const sendEmail = async () => {
    return storageService.sendKeyQrCodeViaEmail({
      lockAddress,
      network,
      tokenId,
    })
  }

  const sendEmailMutation = useMutation(sendEmail)

  const onSendQrCode = async () => {
    if (!network) return
    if (!storageService) return
    if (!walletService) return

    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network,
    })

    ToastHelper.promise(sendEmailMutation.mutateAsync(), {
      success: 'QR-code sent by email',
      loading: 'Sending QR-code by email',
      error: 'We could not send the QR-code.',
    })
  }

  const isCheckedIn = typeof getCheckInTime() === 'string' || !!checkInTimestamp
  const hasEmail = items.map(([key]) => key.toLowerCase()).includes('email')
  const hasExtraData = items?.length > 0 || isCheckedIn

  const onEmailChange = (values: FieldValues) => {
    setData({
      ...data,
      ...values,
    })
  }

  const onMarkAsCheckIn = async () => {
    if (!storageService) return
    const { lockAddress, token: keyId } = data
    return storageService.markTicketAsCheckedIn({
      lockAddress,
      keyId,
      network: network!,
    })
  }

  const markAsCheckInMutation = useMutation(onMarkAsCheckIn, {
    onSuccess: (response: any) => {
      if (!response.ok && response.status === 409) {
        ToastHelper.error('Ticket already checked in')
      }

      if (response.ok) {
        setCheckedInTimestamp(new Date().toLocaleString())
        ToastHelper.success('Successfully marked ticket as checked-in')
      }
    },
    onError: () => {
      ToastHelper.error('Error on marking ticket as checked-in')
    },
  })

  return (
    <>
      <UpdateEmailModal
        isOpen={addEmailModalOpen ?? false}
        setIsOpen={setAddEmailModalOpen}
        isLockManager={isLockManager ?? false}
        userAddress={owner}
        lockAddress={lockAddress}
        network={network!}
        hasExtraData={hasExtraData}
        hasEmail={hasEmail}
        extraDataItems={items as any}
        onEmailChange={onEmailChange}
      />
      <div className="flex flex-col gap-3 md:flex-row">
        {!isCheckedIn && (
          <Button
            variant="outlined-primary"
            size="small"
            onClick={() => markAsCheckInMutation.mutate()}
            disabled={markAsCheckInMutation.isLoading}
            loading={markAsCheckInMutation.isLoading}
          >
            Mark as Checked-in
          </Button>
        )}
        {hasEmail ? (
          <>
            <Button
              size="small"
              variant="outlined-primary"
              onClick={onSendQrCode}
              disabled={
                sendEmailMutation.isLoading || sendEmailMutation.isSuccess
              }
            >
              {sendEmailMutation.isSuccess
                ? 'QR-code sent by email'
                : 'Send QR-code by email'}
            </Button>
            <Button
              size="small"
              variant="outlined-primary"
              onClick={() => setAddEmailModalOpen(true)}
            >
              Edit email
            </Button>
          </>
        ) : (
          <Button
            variant="outlined-primary"
            size="small"
            onClick={() => setAddEmailModalOpen(true)}
          >
            Add email
          </Button>
        )}
      </div>
      <div className="pt-6">
        <div className="mt-6">
          {isCheckedIn && (
            <Badge
              size="tiny"
              variant="green"
              iconRight={<CheckIcon size={11} />}
              className="mb-4"
            >
              <span className="text-sm font-semibold">Checked-in</span>
            </Badge>
          )}
          <div className="flex flex-col gap-4">
            {isCheckedIn && (
              <MetadataDetail label="Checked-in at">
                {getCheckInTime()}
              </MetadataDetail>
            )}

            {items?.map(([key, value], index) => {
              return (
                <MetadataDetail key={`${key}-${index}`} label={`${key}`}>
                  {value}
                </MetadataDetail>
              )
            })}
            <MetadataDetail
              label="Key Holder"
              append={
                <>
                  <Button
                    className="p-0 text-brand-ui-primary"
                    variant="transparent"
                    aria-label="blockscan link"
                  >
                    <a
                      href={`https://blockscan.com/address/${owner}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLinkIcon size={20} />
                    </a>
                  </Button>
                </>
              }
            >
              {owner}
            </MetadataDetail>
            {isSubscriptionLoading && <LoadingIcon />}
            {!isSubscriptionLoading && subscription && (
              <>
                <MetadataDetail label="User Balance">
                  {subscription.balance.amount} {subscription.balance.symbol}
                </MetadataDetail>
                <MembershipRenewal
                  possibleRenewals={subscription.possibleRenewals}
                  approvedRenewals={subscription.approvedRenewals}
                  balance={subscription.balance}
                />
                {expirationDuration && expirationDuration !== MAX_UINT && (
                  <MetadataDetail label="Renewal duration">
                    {durationAsText(expirationDuration)}
                  </MetadataDetail>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const UpdateEmailModal = ({
  isOpen,
  setIsOpen,
  isLockManager,
  userAddress,
  lockAddress,
  network,
  hasExtraData,
  hasEmail,
  extraDataItems,
  onEmailChange,
}: {
  isOpen: boolean
  isLockManager: boolean
  userAddress: string
  lockAddress: string
  network: number
  hasExtraData: boolean
  hasEmail: boolean
  extraDataItems: [string, string | number][]
  setIsOpen: (status: boolean) => void
  onEmailChange: (values: FieldValues) => void
}) => {
  const storage = useStorageService()

  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: '',
    },
  })

  const updateData = (formFields: FieldValues) => {
    reset() // reset form state
    setLoading(false)
    setIsOpen(false)
    if (typeof onEmailChange === 'function') {
      onEmailChange(formFields)
    }
  }

  const createMetadata = async (params: any, callback?: () => void) => {
    try {
      const createMetadataPromise = storage.createtMetadata(params)
      await ToastHelper.promise(createMetadataPromise, {
        loading: 'Saving email address',
        success: 'Email successfully added to member',
        error: 'We could not save the email address.',
      })
      if (typeof callback === 'function') {
        callback()
      }
    } catch (err: any) {
      ToastHelper.error(
        err?.message || `Can't update metadata, please try again.`
      )
    }
  }

  const updateMetadata = async (params: any, callback?: () => void) => {
    const updateMetadataPromise = storage.updatetMetadata(params)
    await ToastHelper.promise(updateMetadataPromise, {
      loading: 'Updating email address',
      success: 'Email successfully added to member',
      error: `Can't update the email address.`,
    })
    if (typeof callback === 'function') {
      callback()
    }
  }
  /**
   * Update metadata or create a new set when not exists
   * @param {formFields} formFields - useForm data set, all data present in form will be saved as metadata
   */
  const onUpdateValue = async (formFields: FieldValues) => {
    if (!isLockManager) return
    try {
      setLoading(true)
      let metadata = {}

      extraDataItems.map(([key, value]: [string, string | number]) => {
        metadata = {
          ...metadata,
          [key]: value,
        }
      })

      // merge old metadata with new one to prevent data lost
      metadata = {
        ...metadata,
        ...formFields,
      }

      const params = {
        lockAddress,
        userAddress,
        network,
        metadata,
      }

      if (hasExtraData) {
        updateMetadata(params, () => {
          updateData(formFields)
        })
      } else {
        createMetadata(params, () => {
          updateData(formFields)
        })
      }
    } catch (err) {
      ToastHelper.error('There is some unexpected issue, please try again')
    }
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex flex-col gap-3">
        <span className="mr-0 font-semibold text-md">
          {hasEmail ? 'Update email address' : 'Add email address to metadata'}
        </span>
        <form onSubmit={handleSubmit(onUpdateValue)}>
          <Input
            type="email"
            {...register('email', {
              required: true,
            })}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Abort
            </Button>
            <Button type="submit" disabled={loading}>
              {hasEmail ? 'Update email' : 'Add email'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
