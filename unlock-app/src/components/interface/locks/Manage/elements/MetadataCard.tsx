import {
  Button,
  Modal,
  Detail,
  AddressInput,
  isAddressOrEns,
  Tooltip,
} from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useLockManager } from '~/hooks/useLockManager'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { ADDRESS_ZERO, MAX_UINT, UNLIMITED_RENEWAL_LIMIT } from '~/constants'
import { durationAsText } from '~/utils/durations'
import { locksmith } from '~/config/locksmith'
import { useGetReceiptsPageUrl } from '~/hooks/useReceipts'
import Link from 'next/link'
import { TbReceipt as ReceiptIcon } from 'react-icons/tb'
import { addressMinify } from '~/utils/strings'
import { onResolveName } from '~/utils/resolvers'
import { useMetadata } from '~/hooks/metadata'
import { LockType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { FiInfo as InfoIcon } from 'react-icons/fi'
import { TransferKeyDrawer } from '~/components/interface/keychain/TransferKeyDrawer'
import { WrappedAddress } from '~/components/interface/WrappedAddress'
import { UpdateEmailModal } from '~/components/content/event/attendees/UpdateEmailModal'
import { useProvider } from '~/hooks/useProvider'
import networks from '@unlock-protocol/networks'

interface MetadataCardProps {
  metadata: any
  owner: string
  network: number
  expirationDuration?: string
  lockSettings?: Record<string, any>
  isExpired?: boolean
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
  'data',
  'transactionsHash',
  'createdAt',
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
  const possible = BigInt(possibleRenewals)
  const approved = BigInt(approvedRenewals)

  if (possible >= 0) {
    return (
      <Detail className="py-2" label="Renewals:" inline justify={false}>
        User balance of {balance.amount} {balance.symbol} is too low to renew
      </Detail>
    )
  }

  if (approved >= 0) {
    return (
      <Detail className="py-2" label="Renewals" inline justify={false}>
        No renewals approved
      </Detail>
    )
  }

  if (approved > 0 && approved >= UNLIMITED_RENEWAL_LIMIT) {
    return (
      <Detail className="py-2" label="Renewals" inline justify={false}>
        {approved.toString()} times
      </Detail>
    )
  }

  if (approved > UNLIMITED_RENEWAL_LIMIT) {
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
  const { getWalletService } = useProvider()
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

  const changeManagerMutation = useMutation({
    mutationFn: setKeyManagerForKey,
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
    managerUnchanged || changeManagerMutation.isPending || !isValid

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
                      disabled={changeManagerMutation.isPending}
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
              loading={changeManagerMutation.isPending}
            >
              Update
            </Button>
          </form>
        </div>
      </Modal>
      <Button
        className="w-full md:w-auto whitespace-nowrap"
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
  isExpired,
}: MetadataCardProps) => {
  const [showTransferKey, setShowTransferKey] = useState(false)

  const [data, setData] = useState(metadata)

  const [addEmailModalOpen, setAddEmailModalOpen] = useState(false)

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

  const { isPending: isLoadingUrl, data: receiptsPageUrl } =
    useGetReceiptsPageUrl({
      lockAddress,
      network,
      tokenId: metadata.token,
    })

  const { data: subscription, isPending: isSubscriptionLoading } = useQuery({
    queryKey: ['subscription', lockAddress, tokenId, network],
    queryFn: async () => {
      const response = await locksmith.getSubscription(
        network,
        lockAddress,
        tokenId
      )
      return response.data.subscriptions?.[0] ?? null
    },
  })

  const sendEmail = async () => {
    return locksmith.emailTicket(network, lockAddress, tokenId)
  }

  const sendEmailMutation = useMutation({
    mutationFn: sendEmail,
  })

  const onSendQrCode = async () => {
    if (!network) return

    ToastHelper.promise(sendEmailMutation.mutateAsync(), {
      success: 'Email sent',

      loading: 'Sending email...',

      error: 'We could not send email.',
    })
  }

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
          <div className="flex flex-col divide-y divide-gray-400">
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
                              sendEmailMutation.isPending ||
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
                        <span>Owner:</span>
                        <Link
                          href={`/keychain?owner=${owner}`}
                          className="flex gap-2 text-brand-ui-primary"
                        >
                          {/* show full address on desktop */}
                          <div className="text-base font-semibold text-black break-words">
                            <div className="hidden md:block">
                              <WrappedAddress
                                address={owner}
                                showCopyIcon={false}
                                showExternalLink={false}
                              />
                            </div>
                            {/* show minified address on mobile */}
                            <div className="block md:hidden">
                              <WrappedAddress
                                address={owner}
                                minified
                                showCopyIcon={false}
                                showExternalLink={false}
                              />
                            </div>
                          </div>
                        </Link>
                      </div>
                    </Tooltip>
                  </div>
                  <div className="md:ml-auto">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      {isLockManager && (
                        <>
                          {isExpired ? (
                            // conditionally render Tooltip if membership is expired
                            <Tooltip
                              tip="Expired memberships can't be transferred"
                              label="Expired memberships can't be transferred."
                            >
                              <Button
                                size="small"
                                className="w-full md:w-auto"
                                disabled={isExpired}
                              >
                                Transfer
                              </Button>
                            </Tooltip>
                          ) : (
                            <Button
                              size="small"
                              onClick={() => setShowTransferKey(true)}
                              className="w-full md:w-auto"
                              disabled={isExpired}
                            >
                              Transfer
                            </Button>
                          )}
                        </>
                      )}
                      {ownerIsManager && (
                        <div className="md:ml-auto">
                          <ChangeManagerModal
                            lockAddress={lockAddress}
                            network={network}
                            manager={manager}
                            tokenId={tokenId}
                            label="Set manager"
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
            <Detail
              label={
                <div className="flex flex-col justify-between w-full gap-2 md:items-center md:flex-row">
                  <Tooltip
                    tip="Time at which the NFT was minted."
                    label="Time at which the NFT was minted."
                    side="bottom"
                  >
                    <div className="flex items-center gap-2">
                      <span>Created at:</span>
                      {networks[network].explorer?.urls?.transaction &&
                      data.transactionsHash[0] ? (
                        <Link
                          target="_blank"
                          rel="noreferrer"
                          href={`${networks[network].explorer?.urls?.transaction(data.transactionsHash[0])}`}
                        >
                          <div className="text-base font-semibold text-black break-words">
                            {new Date(data.createdAt * 1000).toLocaleString()}
                          </div>
                        </Link>
                      ) : (
                        <div className="text-base font-semibold text-black break-words">
                          {new Date(data.createdAt * 1000).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </div>
              }
              className="py-2"
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
                            <span>Manager</span>
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
                        label="Update"
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
            {!isSubscriptionLoading &&
              subscription &&
              expirationDuration &&
              expirationDuration !== MAX_UINT && (
                <>
                  <Detail
                    className="py-2"
                    label="User Balance:"
                    inline
                    justify={false}
                  >
                    {subscription.balance?.amount}{' '}
                    {subscription.balance?.symbol}
                  </Detail>
                  <MembershipRenewal
                    possibleRenewals={subscription.possibleRenewals!}
                    approvedRenewals={subscription.approvedRenewals!}
                    balance={subscription.balance as any}
                  />
                  {
                    <Detail
                      className="py-2"
                      label="Renewal duration:"
                      inline
                      justify={false}
                    >
                      {durationAsText(expirationDuration)}
                    </Detail>
                  }
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
