import React, { useEffect, useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Locks, Lock } from '../../../unlockTypes'
import Drawer from '../../interface/Drawer'
import { WalletServiceContext } from '../../../utils/withWalletService'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import {
  Input,
  Label,
  Select,
  Button,
  TransactionPendingButton,
} from '../../interface/checkout/FormStyles'
import { ACCOUNT_REGEXP, MAX_UINT } from '../../../constants'
import { getAddressForName } from '../../../hooks/useEns'
import { useMultipleRecipient } from '../../../hooks/useMultipleRecipient'

interface GrantKeyFormProps {
  lock: Lock
  onGranted: (granted: boolean) => void
  recipients: any[]
  addRecipientItem: <T>(recipient: string, metadata: T) => Promise<any>
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
const GrantKeyForm = ({
  onGranted,
  lock,
  recipients,
  addRecipientItem,
}: GrantKeyFormProps) => {
  const { account, network } = useContext(AuthenticationContext)

  const walletService = useContext(WalletServiceContext)
  const web3Service = useContext(Web3ServiceContext)
  const [transaction, setTransaction] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [expirationInputDisabled, setExpirationInputDisabled] = useState(
    lock.expirationDuration === -1
  )
  const disableGrantKeys = recipients?.length === 0

  const defaultValues = {
    recipient: '',
    expiration: formatDate(lock.expirationDuration),
    keyManager: '',
    neverExpires: lock.expirationDuration === -1,
  }

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isDirty },
    setValue,
    getValues,
    trigger,
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues,
  })

  console.log(lock)
  useEffect(() => reset(defaultValues), [lock.name])

  interface onSubmitInterface {
    recipient: string
    keyManager: string
    expiration: string
    neverExpires: boolean
  }

  const onSubmit = async ({
    recipient,
    keyManager,
    expiration,
    neverExpires,
  }: onSubmitInterface) => {
    setLoading(true)
    try {
      const existingExpiration =
        await web3Service.getKeyExpirationByLockForOwner(
          lock.address,
          recipient,
          network
        )
      if (existingExpiration > new Date().getTime() / 1000) {
        toast.error(
          'This address already owns a valid key. You cannot grant them a new one.'
        )
        onGranted(false)
      } else {
        await toast.promise(
          walletService.grantKey(
            {
              lockAddress: lock.address,
              recipient,
              expiration: neverExpires
                ? MAX_UINT
                : Math.floor(new Date(expiration).getTime() / 1000),
              keyManager: keyManager || account,
            },
            (error: any, hash: string) => {
              if (error) {
                toast.error(
                  'There was an error and the key could not be granted. Please refresh the page and try again.'
                )
              }
              if (hash) {
                setTransaction(hash)
              }
            }
          ),
          {
            loading: `Granting key to ${recipient}`,
            success: `Successfully granted key to ${recipient}`,
            error: `There was an error in granting key to ${recipient}. Please try again.`,
          },
          {
            className: 'break-all',
          }
        )
        setTransaction('')
      }
      onGranted(true)
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
    const { recipient, expiration, keyManager, neverExpires } = getValues()
    if (isFormValid) {
      const expirationTime = neverExpires
        ? MAX_UINT
        : Math.floor(new Date(expiration).getTime() / 1000)

      const metadata = {
        lockAddress: lock.address,
        expiration: expirationTime,
        keyManager: keyManager || account,
      }
      await addRecipientItem(recipient, metadata)
      reset(defaultValues)
    }
  }

  const hasRecipients = recipients?.length > 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-screen-lg">
      <div className="flex flex-wrap mb-6 -mx-3">
        <div className="w-full px-3">
          <Label htmlFor="grid-recipient">Recipient</Label>
          <Input
            id="grid-recipient"
            type="text"
            placeholder="0x..."
            {...register('recipient', {
              required: true,
              onChange: addressFieldChanged('recipient'),
              pattern: ACCOUNT_REGEXP,
            })}
          />
          {errors.recipient && (
            <p className="text-xs -mt-4 text-[#f24c15]">
              Please make sure you enter a valid Ethereum address
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap mb-6 -mx-3">
        <div className="w-full px-3">
          <Label htmlFor="grid-expiration">Expiration</Label>
          <Input
            disabled={expirationInputDisabled}
            id="grid-expiration"
            type="datetime-local"
            {...register('expiration')}
          />
          <div className="-mt-3">
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
      </div>

      <div className="flex flex-wrap mb-6 -mx-3">
        <div className="w-full px-3">
          <Label htmlFor="grid-key-manager">Key Manager</Label>
          <Input
            id="grid-key-manager"
            type="text"
            placeholder="0x..."
            {...register('keyManager', {
              pattern: ACCOUNT_REGEXP,
              onChange: addressFieldChanged('keyManager'),
            })}
          />
          {errors.keyManager && (
            <p className="text-xs -mt-4 text-[#f24c15]">
              This Ethereum address is not valid.
            </p>
          )}

          {!errors.keyManager && (
            <p className="-mt-4 text-xs italic">
              If set the key manager has the transfer and cancellation rights
              for the recipient&apos;s key. If you leave empty, your address
              will be set as manager.
            </p>
          )}
        </div>
      </div>

      {!loading && (
        <>
          <Button
            className="bg-gray-100 px-2 py-1 mb-2"
            type="button"
            onClick={addRecipient}
            disabled={!isDirty}
          >
            Add recipient
          </Button>
          {hasRecipients && (
            <div className="flex flex-wrap mb-3">
              <div className="w-full">
                <span className="text-sm font-medium text-gray-900">
                  Airdrop recipients list:
                </span>
                <ul className="list-disc px-3">
                  {recipients?.map(({ userAddress, index }) => {
                    return <li key={index}>{userAddress}</li>
                  })}
                </ul>
              </div>
            </div>
          )}
          <button
            className="bg-[#74ce63] text-white flex justify-center w-full px-4 py-3 font-medium rounded hover:bg-[#59c245] disabled:opacity-40"
            type="submit"
            disabled={disableGrantKeys}
          >
            {`Grant ${recipients?.length} Key`}
          </button>
        </>
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
  const { recipients, addRecipientItem } = useMultipleRecipient(
    lock?.address,
    network,
    Infinity
  )

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
          <Label htmlFor="grid-lock">Lock</Label>

          <Select id="grid-lock" onChange={handleLockChanged}>
            {Object.keys(locks).map((address) => (
              <option value={address} key={address}>
                {locks[address].name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {lock?.canGrant && (
        <GrantKeyForm
          onGranted={handleGranted}
          lock={lock}
          recipients={recipients}
          addRecipientItem={addRecipientItem}
        />
      )}

      {!lock?.canGrant && (
        <p className="text-xs -mt-4 text-[#f24c15]">
          Please check that you are a lock manager or key granter for this lock.
        </p>
      )}
    </Drawer>
  )
}

export default GrantKeysDrawer
