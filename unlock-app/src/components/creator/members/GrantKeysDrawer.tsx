import React, { useEffect, useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { Locks, Lock } from '../../../unlockTypes'
import Drawer from '../../interface/Drawer'
import { useWalletService } from '~/utils/withWalletService'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import {
  Select,
  TransactionPendingButton,
} from '../../interface/checkout/FormStyles'
import { ACCOUNT_REGEXP, MAX_UINT } from '../../../constants'
import { getAddressForName } from '../../../hooks/useEns'
import { useMultipleRecipient } from '../../../hooks/useMultipleRecipient'
import { ToastHelper } from '../../helpers/toast.helper'
import { useStorageService } from '~/utils/withStorageService'
import { formResultToMetadata } from '~/utils/userMetadata'
import { Button, Input } from '@unlock-protocol/ui'

interface GrantKeyFormProps {
  lock: Lock
  onGranted: (granted: boolean) => void
}

interface MetadataProps {
  lockAddress: string
  email: string
  expiration: string | number
  keyManager?: string
  neverExpires: boolean
}

// Prevents re-rendering when time changes!
const now = new Date().getTime()

/**
 * https://stackoverflow.com/questions/30166338/setting-value-of-datetime-local-from-date
 * The `datetime-local` input fields takes a string in a specific format
 * so we format it for it to be used there.
 * @param date
 * @returns
 */
const formatDate = (timestamp: number) => {
  if (timestamp === -1) {
    return ''
  }
  const date = new Date(now + timestamp * 1000)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

/**
 * Form part
 * @returns
 */
const GrantKeyForm = ({ onGranted, lock }: GrantKeyFormProps) => {
  const { account, network } = useContext(AuthenticationContext)
  const storageService = useStorageService()

  const walletService = useWalletService()
  const [transaction, setTransaction] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [expirationInputDisabled, setExpirationInputDisabled] = useState(
    lock.expirationDuration === -1
  )
  const {
    recipients: recipientItems,
    addRecipientItem,
    clear,
  } = useMultipleRecipient(lock, {
    maxRecipients: Infinity,
    locks: {
      [lock.address]: {
        network,
      },
    },
    network,
  })

  const disableGrantKeys = recipientItems?.length === 0 && !loading

  const defaultValues = {
    recipient: '',
    email: '',
    expiration: formatDate(lock.expirationDuration),
    keyManager: '',
    neverExpires: lock.expirationDuration === -1,
  }

  const {
    register,
    reset,
    formState: { errors, isDirty },
    setValue,
    getValues,
    trigger,
    handleSubmit,
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues,
  })

  useEffect(() => reset(defaultValues), [lock.name])

  const onSubmit = async () => {
    setLoading(true)
    try {
      const recipients = recipientItems?.map(
        ({ resolvedAddress }) => resolvedAddress
      )
      const expirations = recipientItems?.map(({ metadata }) => {
        return metadata?.neverExpires ? MAX_UINT : metadata?.expiration
      })
      const keyManagers = recipientItems?.map(
        ({ metadata }) => metadata?.keyManager || account
      )

      const users = recipientItems.map(({ metadata = {}, resolvedAddress }) => {
        const formattedMetadata = formResultToMetadata(
          {
            email: metadata.email ?? '',
          },
          []
        )
        return {
          userAddress: resolvedAddress,
          metadata: {
            public: formattedMetadata.publicData,
            protected: formattedMetadata.protectedData,
          },
          lockAddress: lock!.address,
        }
      })
      // save email for all recipients before airdrops keys
      await storageService.submitMetadata(users, network!)

      await ToastHelper.promise(
        walletService.grantKeys(
          {
            lockAddress: lock.address,
            recipients,
            expirations,
            keyManagers,
          },
          (error, hash) => {
            if (error) {
              ToastHelper.error(
                'There was an error and the keys could not be granted. Please refresh the page and try again.'
              )
            }
            if (hash) {
              setTransaction(hash)
            }
          }
        ),
        {
          loading: `Granting ${recipients?.length} keys`,
          success: `Successfully granted ${recipients?.length} keys`,
          error: 'There was an error in granting keys. Please try again.',
        },
        {
          className: 'break-all',
        }
      )
      setTransaction('')
      onGranted(true)
      clear()
    } catch (error) {
      console.error(error)
      setTransaction('')
    }
    setLoading(false)
  }

  const addressFieldChanged = (name: string) => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      const address = await getAddressForName(event.target.value)
      if (address) {
        return setValue(
          name as 'recipient' | 'expiration' | 'keyManager',
          address,
          {
            shouldValidate: true,
            shouldDirty: true,
          }
        )
      }
    }
  }

  const addRecipient = async () => {
    const isFormValid = await trigger()
    const { recipient, expiration, keyManager, neverExpires, email } =
      getValues()
    if (isFormValid) {
      const expirationTime = neverExpires
        ? MAX_UINT
        : Math.floor(new Date(expiration).getTime() / 1000)

      const metadata: MetadataProps = {
        lockAddress: lock.address,
        expiration: expirationTime,
        keyManager: keyManager || account,
        neverExpires,
        email,
      }
      const valid = await addRecipientItem(recipient, metadata)
      if (valid) {
        reset(defaultValues)
      }
    }
  }

  const hasRecipients = recipientItems?.length > 0

  return (
    <form
      className="w-full max-w-screen-lg"
      onSubmit={handleSubmit(addRecipient)}
    >
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <Input
            label="Recipient"
            type="text"
            placeholder="0x..."
            {...register('recipient', {
              required: true,
              onChange: addressFieldChanged('recipient'),
              pattern: ACCOUNT_REGEXP,
            })}
          />
          {errors.recipient && (
            <p className="text-xs text-[#f24c15]">
              Please make sure you enter a valid Ethereum address
            </p>
          )}
        </div>
        <div className="w-full">
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            {...register('email', {
              required: true,
              onChange: addressFieldChanged('email'),
            })}
          />
          {errors.recipient && (
            <p className="text-xs text-[#f24c15]">
              Please make sure you enter a valid Ethereum address
            </p>
          )}
        </div>
        <div className="w-full">
          <Input
            label="Expiration"
            disabled={expirationInputDisabled}
            type="datetime-local"
            {...register('expiration')}
          />
          <div>
            <label htmlFor="never-expires">
              Never Expires
              <input
                id="never-expires"
                className="ml-2 align-middle"
                type="checkbox"
                {...register('neverExpires', {
                  onChange: () => {
                    setExpirationInputDisabled(!expirationInputDisabled)
                    setValue('expiration', '')
                  },
                })}
              />
            </label>
          </div>
          <p className="text-xs italic">
            This is pre-filled based on the default duration of your lock.
          </p>
        </div>
        <div className="w-full">
          <Input
            label="Key Manager"
            type="text"
            placeholder="0x..."
            {...register('keyManager', {
              pattern: ACCOUNT_REGEXP,
              onChange: addressFieldChanged('keyManager'),
            })}
          />
          {errors.keyManager && (
            <p className="text-xs text-[#f24c15]">
              This Ethereum address is not valid.
            </p>
          )}

          {!errors.keyManager && (
            <p className="text-xs italic">
              If set the key manager has the transfer and cancellation rights
              for the recipient&apos;s key. If you leave empty, your address
              will be set as manager.
            </p>
          )}
        </div>
      </div>

      {!loading && (
        <div className="flex flex-col gap-2 mt-4">
          <Button className="w-100" type="submit" disabled={!isDirty}>
            Add recipient
          </Button>
          {hasRecipients && (
            <div className="flex flex-wrap mb-3">
              <div className="w-full">
                <span className="text-sm font-medium text-gray-900">
                  Airdrop recipients list:
                </span>
                <ul className="list-disc px-3">
                  {recipientItems?.map(({ userAddress, index }) => {
                    return <li key={index}>{userAddress}</li>
                  })}
                </ul>
              </div>
            </div>
          )}
          <Button disabled={disableGrantKeys} onClick={onSubmit}>
            {`Grant ${recipientItems?.length} Key`}
          </Button>
        </div>
      )}
      {loading && network && (
        <TransactionPendingButton network={network} transaction={transaction} />
      )}
    </form>
  )
}

interface GrantKeysDrawerInterface {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  lockAddresses: string[]
}

export const GrantKeysDrawer = ({
  isOpen,
  setIsOpen,
  lockAddresses,
}: GrantKeysDrawerInterface) => {
  const { network, account } = useContext(AuthenticationContext) // TODO: use the actual lock network instead of the currently connected network

  const web3Service = useContext(Web3ServiceContext)
  const [locks, setLocks] = useState<any>({})
  const [lock, setLock] = useState<any>(null)

  // Let's load the locks's details
  useEffect(() => {
    const loadLocks = async (lockAddresses: string[]) => {
      const locks: Locks = {}
      await Promise.all(
        lockAddresses.map(async (address: string) => {
          locks[address] = await web3Service.getLock(address, network)
          locks[address].address = address // FIXME getLock does not set address on the lock object...

          // Look if the current user can grant keys
          locks[address].canGrant = await web3Service.isLockManager(
            address,
            account,
            network
          )
          if (!locks[address].canGrant) {
            locks[address].canGrant = await web3Service.isKeyGranter(
              address,
              account,
              network
            )
          }
        })
      )
      setLock(locks[lockAddresses[0]])
      setLocks(locks)
    }
    loadLocks(lockAddresses)
  }, [lockAddresses.join('')])

  const handleLockChanged = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setLock(locks[evt.target.value])
  }

  const handleGranted = (granted: boolean) => {
    if (granted) {
      setIsOpen(false)
    }
  }

  return (
    <Drawer title="Airdrop Keys" isOpen={isOpen} setIsOpen={setIsOpen}>
      <p className="mb-6">
        As a lock manager or key granter you can grant keys to any address. You
        can also set a custom expiration date as well as a custom key manager
        for this specific key.
      </p>

      <div className="flex flex-wrap mb-6 -mx-3">
        <div className="w-full px-3">
          <label className="px-1 text-base" htmlFor="grid-lock">
            Lock
          </label>

          <Select id="grid-lock" onChange={handleLockChanged}>
            {Object.keys(locks).map((address) => (
              <option value={address} key={address}>
                {locks[address].name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {lock?.canGrant && <GrantKeyForm onGranted={handleGranted} lock={lock} />}

      {!lock?.canGrant && (
        <p className="text-xs text-[#f24c15]">
          Please check that you are a lock manager or key granter for this lock.
        </p>
      )}
    </Drawer>
  )
}

export default GrantKeysDrawer
