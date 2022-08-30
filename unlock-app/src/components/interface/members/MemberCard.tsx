import React, { useState, useEffect, useContext } from 'react'
import { Badge, Button, Input, Modal } from '@unlock-protocol/ui'
import { addressMinify } from '../../../utils/strings'
import { RiArrowDropDownLine as ArrowDown } from 'react-icons/ri'
import {
  FaCheckCircle as CheckIcon,
  FaSpinner as Spinner,
} from 'react-icons/fa'
import {
  StorageServiceContext,
  useStorageService,
} from '../../../utils/withStorageService'
import { ToastHelper } from '../../../components/helpers/toast.helper'
import AuthenticationContext from '../../../contexts/AuthenticationContext'
import { WalletServiceContext } from '~/utils/withWalletService'
import useClipboard from 'react-use-clipboard'
import { FieldValues, useForm } from 'react-hook-form'
import useEns from '~/hooks/useEns'
import { expirationAsDate } from '~/utils/durations'
import { useMutation } from 'react-query'

const styles = {
  title: 'text-base font-medium text-black break-all	',
  description: 'text-sm font-normal text-gray-500',
  address: 'text-sm	font-sm font-normal text-gray-600',
}
interface MemberCardProps {
  lockName: string
  expiration: string
  keyholderAddress: string
  tokenId: string
  onExpireAndRefund: (lock: any) => void
  expandAllMetadata: boolean
  showCheckInTimeInfo: boolean
  isLockManager?: boolean
  expireAndRefundDisabled?: boolean
  metadata?: { [key: string]: any }
}

const keysToIgnore = [
  'token',
  'lockName',
  'expiration',
  'checkedInAt',
  'lockAddress',
  'keyholderAddress',
]

export const MemberCardPlaceholder: React.FC<any> = () => {
  return (
    <div className="h-[130px] md:h-[90px] border-2 rounded-lg bg-slate-200 animate-pulse"></div>
  )
}

export const MemberCard: React.FC<MemberCardProps> = ({
  lockName,
  expiration,
  keyholderAddress,
  tokenId,
  onExpireAndRefund,
  expandAllMetadata,
  showCheckInTimeInfo,
  isLockManager,
  expireAndRefundDisabled = true,
  metadata = {},
}) => {
  const storageService = useContext(StorageServiceContext)
  const walletService = useContext(WalletServiceContext)
  const { network, account } = useContext(AuthenticationContext)
  const [showMetaData, setShowMetaData] = useState(expandAllMetadata)
  const [emailSent, setEmailSent] = useState(false)
  const [addEmailModalOpen, setAddEmailModalOpen] = useState(false)
  const [data, setData] = useState(metadata)
  const addressToEns = useEns(keyholderAddress)
  const [checkInTimestamp, setCheckedInTimestamp] = useState<string | null>(
    null
  )
  const [extraDataItems, setExtraDataItems] = useState<
    [string, string | number][]
  >([])

  const [isCopied, setCopied] = useClipboard(keyholderAddress, {
    successDuration: 2000,
  })

  useEffect(() => {
    const items = Object.entries(data || {}).filter(([key]) => {
      return !keysToIgnore.includes(key)
    })
    setExtraDataItems(items)
  }, [data])

  const getCheckInTime = () => {
    const [_, checkInTimeValue] =
      Object.entries(data)?.find(([key]) => key === 'checkedInAt') ?? []
    if (checkInTimestamp) return checkInTimestamp
    if (!checkInTimeValue) return null
    return new Date(checkInTimeValue as number).toLocaleString()
  }
  const toggleMetada = () => {
    if (!isLockManager) return
    setShowMetaData(!showMetaData)
  }

  const isCheckedIn = typeof getCheckInTime() === 'string' || !!checkInTimestamp

  useEffect(() => {
    setShowMetaData(expandAllMetadata)
  }, [expandAllMetadata])

  const hasExtraData = extraDataItems?.length > 0 || isCheckedIn

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

  const onSendQrCode = async () => {
    if (!network) return
    if (!storageService) return
    if (!walletService) return

    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network,
    })

    const sendEmailPromise = storageService.sendKeyQrCodeViaEmail({
      lockAddress: data.lockAddress,
      network,
      tokenId,
    })

    ToastHelper.promise(sendEmailPromise, {
      success: 'QR-code sent by email',
      loading: 'Sending QR-code by email',
      error: 'There is some unexpected issue, please try again',
    })
    setEmailSent(true)
  }

  const onEmailChange = (values: FieldValues) => {
    setData({
      ...data,
      ...values,
    })
  }

  const hasEmailMetadata = extraDataItems
    .map(([key]) => key.toLowerCase())
    .includes('email')

  return (
    <div
      data-testid="member-card"
      className="px-10 py-4 bg-white border-2 rounded-lg hover:shadow-sm"
    >
      <UpdateEmailModal
        isOpen={addEmailModalOpen ?? false}
        setIsOpen={setAddEmailModalOpen}
        isLockManager={isLockManager ?? false}
        userAddress={keyholderAddress}
        lockAddress={data.lockAddress}
        network={network!}
        hasExtraData={hasExtraData}
        hasEmail={hasEmailMetadata}
        extraDataItems={extraDataItems}
        onEmailChange={onEmailChange}
      />
      <div className="grid justify-between grid-cols-7 gap-2 mb-2">
        <div className="flex flex-col col-span-full md:col-span-1">
          <span className={styles.description}>Lock name</span>
          <span className={styles.title}>{lockName}</span>
        </div>
        <div className="flex flex-col col-span-full md:col-span-1">
          <span className={styles.description}>Token ID</span>
          <span className={styles.title}>{tokenId}</span>
        </div>
        <div className="flex flex-col col-span-full md:col-span-2">
          <span className={styles.description}>Owner</span>
          <span className={[styles.title, 'flex gap-2'].join(' ')}>
            <span className="min-w-[120px]">
              {/* ens will not be minified when resolved */}
              {addressToEns === keyholderAddress
                ? addressMinify(keyholderAddress)
                : addressToEns}
            </span>
            <button
              onClick={setCopied}
              type="button"
              className="flex items-center px-4 text-gray-600 border rounded hover:text-black hover:border-gray-300 bg-gray-50"
            >
              {isCopied ? 'Copied' : 'Copy'}
            </button>
          </span>
        </div>
        <div className="flex flex-col col-span-full md:col-span-1">
          <span className={styles.description}>Expiration</span>
          <span className={styles.title}>{expirationAsDate(expiration)}</span>
        </div>
        <div className="flex items-center justify-start gap-2 col-span-full lg:col-span-2 lg:justify-end">
          <Button
            size="small"
            variant="outlined-primary"
            className="disabled:border-opacity-50 disabled:border-gray-200 disabled:text-opacity-50 hover:disabled:text-opacity-50"
            disabled={expireAndRefundDisabled}
            onClick={onExpireAndRefund}
          >
            Expire & Refund
          </Button>
          {isLockManager && (
            <Button size="small" variant="secondary" onClick={toggleMetada}>
              <div className="flex items-center">
                <span>Show metadata</span>
                <ArrowDown />
              </div>
            </Button>
          )}
        </div>
      </div>
      <div>
        {showMetaData && (
          <div>
            <span className={styles.description}>Metadata</span>
            <div className="flex gap-[1rem] my-3">
              {!isCheckedIn && (
                <Button
                  onClick={() => markAsCheckInMutation.mutate()}
                  variant="outlined-primary"
                  size="tiny"
                  disabled={markAsCheckInMutation.isLoading}
                >
                  <div className="flex">
                    {markAsCheckInMutation.isLoading && (
                      <Spinner className="mr-1 animate-spin" />
                    )}
                    <span>Mark as Checked-in</span>
                  </div>
                </Button>
              )}
              {hasEmailMetadata ? (
                <>
                  <Button
                    size="tiny"
                    variant="outlined-primary"
                    onClick={onSendQrCode}
                    disabled={emailSent}
                  >
                    Send QR-code by email
                  </Button>
                  <Button
                    size="tiny"
                    onClick={() => setAddEmailModalOpen(true)}
                    variant="outlined-primary"
                  >
                    Edit email
                  </Button>
                </>
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
            {showCheckInTimeInfo && isCheckedIn && (
              <span className="block py-2">
                <Badge
                  size="tiny"
                  variant="green"
                  iconRight={<CheckIcon size={11} />}
                >
                  Checked-in
                </Badge>
              </span>
            )}
            <span className="block">
              <strong>Key Holder:</strong>{' '}
              <span>{metadata?.keyholderAddress}</span>
            </span>
            {(hasExtraData || isCheckedIn) && (
              <>
                {isCheckedIn && (
                  <div>
                    <strong>Checked-in At:</strong>{' '}
                    <span>{getCheckInTime()}</span>
                  </div>
                )}
                {extraDataItems?.map(([key, value], index) => {
                  return (
                    <div key={index}>
                      <strong>{key}</strong>: <span>{value}</span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
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
    reset() // reset fomr state
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
        success: 'Email succesfully added to member',
        error: 'There is some unexpected issue, please try again',
      })
      if (typeof callback === 'function') {
        callback()
      }
    } catch (err: any) {
      ToastHelper.error(err?.message || 'There is some unexpected issue')
    }
  }

  const updateMetadata = async (params: any, callback?: () => void) => {
    const updateMetadataPromise = storage.updatetMetadata(params)
    await ToastHelper.promise(updateMetadataPromise, {
      loading: 'Updating email address',
      success: 'Email succesfully added to member',
      error: 'There is some unexpected issue, please try again',
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
      <div className="flex flex-col gap-3 p-4">
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
