import {
  Button,
  Badge,
  Input,
  Modal,
  Detail,
  AddressInput,
  isAddressOrEns,
  Tooltip,
} from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { FaCheckCircle as CheckIcon } from 'react-icons/fa'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useLockManager } from '~/hooks/useLockManager'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { ethers } from 'ethers'
import { ADDRESS_ZERO, MAX_UINT, UNLIMITED_RENEWAL_LIMIT } from '~/constants'
import { durationAsText } from '~/utils/durations'
import { storage } from '~/config/storage'
import { AxiosError } from 'axios'
import { useGetReceiptsPageUrl } from '~/hooks/useReceipts'
import Link from 'next/link'
import { TbReceipt as ReceiptIcon } from 'react-icons/tb'
import { addressMinify } from '~/utils/strings'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useUpdateUserMetadata } from '~/hooks/useUserMetadata'
import { onResolveName } from '~/utils/resolvers'
import { useMetadata } from '~/hooks/metadata'
import { LockType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { FiInfo as InfoIcon } from 'react-icons/fi'
import { TransferKeyDrawer } from '~/components/interface/keychain/TransferKeyDrawer'

interface MetadataCardProps {
  metadata: any
  owner: string
  network: number
  expirationDuration?: string
  lockSettings?: Record<string, any>
}

const keysToIgnore = [
  'token',
  'lockName',
  'expiration',
  'keyholderAddress',
  'keyManager',
  'lockAddress',
  'checkedInAt',
  'email',
]

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
      <Detail className="py-2" label="Renewals" inline justify={false}>
        User balance of {balance.amount} {balance.symbol} is too low to renew
      </Detail>
    )
  }

  if (approved.lte(0)) {
    return (
      <Detail className="py-2" label="Renewals" inline justify={false}>
        No renewals approved
      </Detail>
    )
  }

  if (approved.gt(0) && approved.lte(UNLIMITED_RENEWAL_LIMIT)) {
    return (
      <Detail className="py-2" label="Renewals" inline justify={false}>
        {approved.toString()} times
      </Detail>
    )
  }

  if (approved.gt(UNLIMITED_RENEWAL_LIMIT)) {
    return (
      <Detail className="py-2" label="Renewals" inline justify={false}>
        Renews unlimited times
      </Detail>
    )
  }

  return (
    <Detail className="py-2" label="Renewals" inline justify={false}>
      -
    </Detail>
  )
}

const ChangeManagerModal = ({
  lockAddress,
  network,
  manager,
  tokenId,
  onChange,
  label,
}: {
  label?: string
  lockAddress: string
  network: number
  manager: string
  tokenId: string
  onChange?: (keyManager: string) => void
}) => {
  const { getWalletService } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { isValid },
    control,
  } = useForm<{
    newManager: string
  }>({
    defaultValues: {
      newManager: '',
    },
  })

  const newManager = watch('newManager', manager)

  const setKeyManagerForKey = async (newManager: string) => {
    const walletService = await getWalletService(network)
    return walletService.setKeyManagerOf({
      lockAddress,
      managerAddress: newManager,
      tokenId,
    })
  }

  const changeManagerMutation = useMutation(setKeyManagerForKey, {
    onSuccess: () => {
      if (typeof onChange === 'function') {
        onChange(newManager)
      }
      ToastHelper.success('Key Manager updated')
      setIsOpen(false)
    },
  })

  const onSubmit = async ({ newManager }: any) => {
    await changeManagerMutation.mutateAsync(newManager)
  }

  const managerUnchanged = newManager?.toLowerCase() === manager?.toLowerCase()

  const fieldDisabled =
    managerUnchanged || changeManagerMutation.isLoading || !isValid

  useEffect(() => {
    if (isOpen) {
      setValue('newManager', '') // reset when modal opens
    }
  }, [isOpen, setValue])

  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="flex flex-col w-full gap-5">
          <div className="text-left">
            <h3 className="text-xl font-semibold text-left text-black-500">
              Change Key Manager
            </h3>
            <span className="text-sm leading-tight text-gray-500">
              Update the address of the Key Manager.
            </span>
          </div>
          <form className="grid w-full gap-3" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="newManager"
              control={control}
              rules={{
                required: true,
                validate: isAddressOrEns,
              }}
              render={() => {
                return (
                  <>
                    <AddressInput
                      label="New Manager"
                      value={newManager}
                      disabled={changeManagerMutation.isLoading}
                      onChange={(value: any) => {
                        setValue('newManager', value, {
                          shouldValidate: true,
                        })
                      }}
                      onResolveName={onResolveName}
                    />
                    {managerUnchanged && (
                      <span className="text-sm text-red-500">
                        This address is already the current manager for this
                        key.
                      </span>
                    )}
                  </>
                )
              }}
            />

            <Button
              disabled={fieldDisabled}
              type="submit"
              loading={changeManagerMutation.isLoading}
            >
              Update
            </Button>
          </form>
        </div>
      </Modal>
      <Button
        className="w-full md:w-auto"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        {label ?? 'Change'}
      </Button>
    </>
  )
}
export const MetadataCard = ({
  metadata,
  owner,
  network,
  expirationDuration,
  lockSettings,
}: MetadataCardProps) => {
  const [showTransferKey, setShowTransferKey] = useState(false)
  const [data, setData] = useState(metadata)
  const [addEmailModalOpen, setAddEmailModalOpen] = useState(false)
  const [checkInTimestamp, setCheckedInTimestamp] = useState<string | null>(
    null
  )

  const items = Object.entries(data || {}).filter(([key]) => {
    return !keysToIgnore.includes(key)
  })

  const { data: lockMetadata } = useMetadata({
    lockAddress: metadata.lockAddress,
    network,
  })

  const types = getLockTypeByMetadata(lockMetadata)
  const [eventType] =
    Object.entries(types ?? {}).find(([, value]) => value === true) ?? []

  const { lockAddress, token: tokenId } = data ?? {}

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  // defaults to the owner when the manager is not set
  const manager = data?.keyManager ?? data?.keyholderAddress

  const { isLoading: isLoadingUrl, data: receiptsPageUrl } =
    useGetReceiptsPageUrl({
      lockAddress,
      network,
      tokenId: metadata.token,
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
      const response = await storage.getSubscription(
        network,
        lockAddress,
        tokenId
      )
      return response.data.subscriptions?.[0] ?? null
    },
    {
      onError(error: any) {
        console.error(error)
      },
    }
  )

  const sendEmail = async () => {
    return storage.emailTicket(network, lockAddress, tokenId)
  }

  const sendEmailMutation = useMutation(sendEmail)

  const onSendQrCode = async () => {
    if (!network) return
    ToastHelper.promise(sendEmailMutation.mutateAsync(), {
      success: 'Email sent',
      loading: 'Sending email...',
      error: 'We could not send email.',
    })
  }

  const isCheckedIn = typeof getCheckInTime() === 'string' || !!checkInTimestamp
  const hasEmail = Object.entries(data || {})
    .map(([key]) => key.toLowerCase())
    .includes('email')

  const onEmailChange = (values: FieldValues) => {
    setData({
      ...data,
      ...values,
    })
  }

  const metadataPageUrl = `/locks/metadata?lockAddress=${lockAddress}&network=${network}&keyId=${tokenId}`

  const onMarkAsCheckIn = async () => {
    const { lockAddress, token: keyId } = data
    return storage.checkTicket(network, lockAddress, keyId)
  }

  const markAsCheckInMutation = useMutation(onMarkAsCheckIn, {
    onSuccess: () => {
      setCheckedInTimestamp(new Date().toLocaleString())
      ToastHelper.success('Successfully marked ticket as checked-in')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          ToastHelper.error('Ticket already checked-in')
          return
        }
      }
      ToastHelper.error('Error on marking ticket as checked-in')
    },
  })

  const ownerIsManager = owner?.toLowerCase() === manager?.toLowerCase()
  const showManager = !ownerIsManager && manager !== ADDRESS_ZERO

  return (
    <>
      <TransferKeyDrawer
        isOpen={showTransferKey}
        setIsOpen={setShowTransferKey}
        lockAddress={lockAddress}
        network={network}
        tokenId={tokenId}
        lockName={lockMetadata?.name}
        owner={data?.keyholderAddress}
      />
      <UpdateEmailModal
        isOpen={addEmailModalOpen ?? false}
        setIsOpen={setAddEmailModalOpen}
        isLockManager={isLockManager ?? false}
        userAddress={owner}
        lockAddress={lockAddress}
        network={network!}
        hasEmail={hasEmail}
        extraDataItems={items as any}
        onEmailChange={onEmailChange}
      />
      <div className="flex flex-col gap-3 md:flex-row">
        <Button variant="outlined-primary" size="small">
          <Link href={metadataPageUrl}>Edit token properties</Link>
        </Button>

        {!isCheckedIn && (
          <Button
            variant="outlined-primary"
            size="small"
            onClick={() => markAsCheckInMutation.mutate()}
            disabled={markAsCheckInMutation.isLoading}
            loading={markAsCheckInMutation.isLoading}
          >
            Mark as checked-in
          </Button>
        )}

        {receiptsPageUrl?.length && (
          <Button
            variant="outlined-primary"
            size="small"
            disabled={isLoadingUrl}
            loading={isLoadingUrl}
          >
            <Link href={receiptsPageUrl}>
              <div className="flex items-center gap-2">
                <span>Show receipts</span>
                <ReceiptIcon size={18} />
              </div>
            </Link>
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
          <div className="flex flex-col divide-y divide-gray-400">
            {isCheckedIn && (
              <Detail
                className="py-2"
                inline
                justify={false}
                label="Checked-in at:"
              >
                {getCheckInTime()}
              </Detail>
            )}
            <Detail
              className="py-2"
              label={
                <div className="flex flex-col w-full gap-2 md:items-center md:flex-row">
                  <span>Email:</span>
                  {hasEmail ? (
                    <div className="flex flex-col w-full gap-3 md:flex-row">
                      <span className="block text-base font-semibold text-black">
                        {data?.email}
                      </span>
                      <Button
                        size="tiny"
                        variant="outlined-primary"
                        onClick={() => setAddEmailModalOpen(true)}
                      >
                        Edit email
                      </Button>
                      {lockSettings?.sendEmail ? (
                        SendEmailMapping[eventType as keyof LockType] && (
                          <Button
                            size="tiny"
                            variant="outlined-primary"
                            onClick={onSendQrCode}
                            disabled={
                              sendEmailMutation.isLoading ||
                              sendEmailMutation.isSuccess
                            }
                          >
                            {sendEmailMutation.isSuccess
                              ? 'Email sent'
                              : SendEmailMapping[eventType as keyof LockType]}
                          </Button>
                        )
                      ) : (
                        <Button size="tiny" variant="outlined-primary" disabled>
                          Email are disabled
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outlined-primary"
                      size="tiny"
                      onClick={() => setAddEmailModalOpen(true)}
                    >
                      Add email
                    </Button>
                  )}
                </div>
              }
            />
            {items?.map(([key, value]: any, index) => {
              return (
                <Detail
                  className="py-2"
                  key={`${key}-${index}`}
                  label={`${key}: `}
                  inline
                  justify={false}
                >
                  {value || null}
                </Detail>
              )
            })}
            <Detail
              className="py-2"
              justify={false}
              label={
                <div className="flex flex-col justify-between w-full gap-2 md:items-center md:flex-row">
                  <div>
                    <Tooltip
                      tip="Address of the owner of the NFT."
                      label="Address of the owner of the NFT."
                      side="bottom"
                    >
                      <div className="flex items-center gap-2">
                        <span>Key Owner </span>
                        <InfoIcon />:
                        <div className="flex gap-2">
                          {/* show full address on desktop */}
                          <div className="text-base font-semibold text-black break-words">
                            <span className="hidden md:block">{owner}</span>
                            {/* show minified address on mobile */}
                            <span className="block md:hidden">
                              {addressMinify(owner)}
                            </span>
                          </div>
                          <Button
                            className="p-0 outline-none text-brand-ui-primary ring-0"
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
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                  <div className="md:ml-auto">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      {isLockManager && (
                        <Button
                          size="small"
                          onClick={() => setShowTransferKey(true)}
                          className="w-full md:w-auto"
                        >
                          Transfer ownership
                        </Button>
                      )}
                      {ownerIsManager && (
                        <div className="md:ml-auto">
                          <ChangeManagerModal
                            lockAddress={lockAddress}
                            network={network}
                            manager={manager}
                            tokenId={tokenId}
                            label="Set key manager"
                            onChange={(keyManager) => {
                              setData({
                                ...data,
                                keyManager,
                              })
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              }
            />
            {showManager && (
              <div className="w-full">
                <Detail
                  className="py-2"
                  label={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tooltip
                          label="Address of the manager of the NFT. This address has the transfer rights for this NFT which cannot be transferred by its owner."
                          tip="Address of the manager of the NFT. This address has the transfer rights for this NFT which cannot be transferred by its owner."
                          side="right"
                        >
                          <div className="flex items-center gap-1">
                            <span>Key Manager </span>
                            <InfoIcon />:
                          </div>
                        </Tooltip>
                        {/* show full address on desktop */}
                        <div className="text-base font-semibold text-black break-words">
                          <span className="hidden md:block">{manager}</span>
                          {/* show minified address on mobile */}
                          <span className="block md:hidden">
                            {addressMinify(manager)}
                          </span>
                        </div>
                        <Button
                          className="p-0 outline-none text-brand-ui-primary ring-0"
                          variant="transparent"
                          aria-label="blockscan link"
                        >
                          <a
                            href={`https://blockscan.com/address/${manager}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLinkIcon size={20} />
                          </a>
                        </Button>
                      </div>
                      <ChangeManagerModal
                        lockAddress={lockAddress}
                        network={network}
                        manager={manager}
                        tokenId={tokenId}
                        label="Change key manager"
                        onChange={(keyManager) => {
                          setData({
                            ...data,
                            keyManager,
                          })
                        }}
                      />
                    </div>
                  }
                />
              </div>
            )}
            {!isSubscriptionLoading && subscription && (
              <>
                <Detail
                  className="py-2"
                  label="User Balance:"
                  inline
                  justify={false}
                >
                  {subscription.balance?.amount} {subscription.balance?.symbol}
                </Detail>
                <MembershipRenewal
                  possibleRenewals={subscription.possibleRenewals!}
                  approvedRenewals={subscription.approvedRenewals!}
                  balance={subscription.balance as any}
                />
                {expirationDuration && expirationDuration !== MAX_UINT && (
                  <Detail
                    className="py-2"
                    label="Renewal duration:"
                    inline
                    justify={false}
                  >
                    {durationAsText(expirationDuration)}
                  </Detail>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const SendEmailMapping: Record<keyof LockType, string> = {
  isCertification: 'Send Certificate by email',
  isEvent: 'Send QR-code by email',
  isStamp: 'Send Stamp by email',
}
const UpdateEmailModal = ({
  isOpen,
  setIsOpen,
  isLockManager,
  userAddress,
  lockAddress,
  network,
  hasEmail,
  onEmailChange,
}: {
  isOpen: boolean
  isLockManager: boolean
  userAddress: string
  lockAddress: string
  network: number
  hasEmail: boolean
  extraDataItems: [string, string | number][]
  setIsOpen: (status: boolean) => void
  onEmailChange: (values: FieldValues) => void
}) => {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: '',
    },
  })
  const { mutateAsync: updateUserMetadata } = useUpdateUserMetadata({
    lockAddress,
    userAddress,
    network,
  })

  const updateData = (formFields: FieldValues) => {
    reset() // reset form state
    setLoading(false)
    setIsOpen(false)
    if (typeof onEmailChange === 'function') {
      onEmailChange(formFields)
    }
  }

  const updateMetadata = async (params: any, callback?: () => void) => {
    const updateMetadataPromise = updateUserMetadata(params)
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

      updateMetadata(
        {
          protected: {
            email: formFields.email,
          },
          public: {},
        },
        () => {
          updateData(formFields)
        }
      )
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
