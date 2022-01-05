import React, { useEffect, useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { Locks, Lock } from '../../../unlockTypes'
import Drawer from '../../interface/Drawer'
import { WalletServiceContext } from '../../../utils/withWalletService'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { ConfigContext } from '../../../utils/withConfig'

import {
  Input,
  Label,
  Select,
  LoadingButton,
  Button,
} from '../../interface/checkout/FormStyles'
import { ACCOUNT_REGEXP } from '../../../constants'

interface GrantKeyFormProps {
  lock: Lock
  onGranted: (granted: boolean) => void
}

// Prevents re-rendering when time changes!
const now = new Date().getTime()

/**
 * https://stackoverflow.com/questions/30166338/setting-value-of-datetime-local-from-date
 * @param date
 * @returns
 */
const formatDate = (date: Date) => {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

/**
 * Form part
 * @returns
 */
const GrantKeyForm = ({ onGranted, lock }: GrantKeyFormProps) => {
  const { account, network } = useContext(AuthenticationContext)
  const config: any = useContext(ConfigContext)

  const walletService = useContext(WalletServiceContext)
  const web3Service = useContext(Web3ServiceContext)

  const [transaction, setTransaction] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const defaultValues = {
    recipient: '',
    expiration: formatDate(new Date(now + lock.expirationDuration * 1000)),
    keyManager: '',
  }

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  })

  useEffect(() => reset(defaultValues), [lock.name])

  interface onSubmitInterface {
    recipient: string
    keyManager: string
    expiration: string
  }

  const onSubmit = async ({
    recipient,
    keyManager,
    expiration,
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
        alert(
          'This address already owns a valid key. You cannot grant them a new one.'
        )
        onGranted(false)
      } else {
        await walletService.grantKey(
          {
            lockAddress: lock.address,
            recipient,
            expiration: Math.floor(new Date(expiration).getTime() / 1000),
            keyManager: keyManager || account,
          },
          (error: any, hash: string) => {
            if (error) {
              alert('There was an error granting the key. Please try again')
            }
            if (hash) {
              setTransaction(hash)
            }
          }
        )
        setTransaction('')
      }
      onGranted(true)
    } catch (error) {
      console.error(error)
      alert(
        'There was an error and the transaction could not be sent. Please refresh the page and try again.'
      )
      setTransaction('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg">
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <Label htmlFor="grid-recipient">Recipient</Label>
          <Input
            id="grid-recipient"
            type="text"
            placeholder="0x..."
            {...register('recipient', {
              required: true,
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
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <Label htmlFor="grid-expiration">Expiration</Label>
          <Input
            id="grid-expiration"
            type="datetime-local"
            {...register('expiration')}
          />
          <p className="text-xs italic -mt-4">
            This is pre-filled based on the default duration of your lock.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <Label htmlFor="grid-key-manager">Key Manager</Label>
          <Input
            id="grid-key-manager"
            type="text"
            placeholder="0x..."
            {...register('keyManager', { pattern: ACCOUNT_REGEXP })}
          />
          {errors.keyManager && (
            <p className="text-xs -mt-4 text-[#f24c15]">
              This Ethereum address is not valid.
            </p>
          )}

          {!errors.keyManager && (
            <p className="text-xs italic -mt-4">
              If set the key manager has the transfer and cancellation rights
              for the recipient&apos;s key. If you leave empty, your address
              will be set as manager.
            </p>
          )}
        </div>
      </div>

      {!loading && <Button type="submit">Grant Key</Button>}
      {loading && (
        <LoadingButton>
          Transaction Mining{' '}
          {transaction && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={config.networks[network].explorer.urls.transaction(
                transaction
              )}
            >
              ↗
            </a>
          )}
        </LoadingButton>
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
  const { network } = useContext(AuthenticationContext) // TODO: use the actual lock network instead of the currently connected network

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
        })
      )
      setLock(locks[lockAddresses[0]])
      setLocks(locks)
    }
    loadLocks(lockAddresses)
  }, [lockAddresses.join('')])

  const handleLockChanged = (evt: any) => {
    setLock(locks[evt.target.value])
  }

  const handleGranted = (granted: boolean) => {
    if (granted) {
      alert('The key was successfuly granted!')
      setIsOpen(false)
    }
  }

  return (
    <Drawer title="Airdrop Keys" isOpen={isOpen} setIsOpen={setIsOpen}>
      <p className="mb-6">
        As a lock manager you can grant keys to any address. You can also set a
        custom expiration date as well as a custom key manager for this specific
        key.
      </p>

      <div className="flex flex-wrap -mx-3 mb-6">
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

      {lock && <GrantKeyForm onGranted={handleGranted} lock={lock} />}
    </Drawer>
  )
}

export default GrantKeysDrawer
