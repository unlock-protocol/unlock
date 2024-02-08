import { Drawer, Placeholder } from '@unlock-protocol/ui'
import { Tab } from '@headlessui/react'
import { AirdropManualForm } from './AirdropManualForm'
import { AirdropBulkForm } from './AirdropBulkForm'
import { AirdropMember } from './AirdropElements'
import { useAuth } from '~/contexts/AuthenticationContext'
import { MAX_UINT } from '~/constants'
import { formatDate } from '~/utils/lock'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { omit } from 'lodash'
import { useMultipleLockData } from '~/hooks/useLockData'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { Select } from '@unlock-protocol/ui'
import { useState } from 'react'
import { Lock } from '~/unlockTypes'

dayjs.extend(customParseFormat)

type Metadata = Record<'public' | 'protected', Record<string, string>>

export const AirdropForm = ({ locks }: { locks: PaywallLocksConfigType }) => {
  const results = useMultipleLockData(locks) as {
    lock: Lock
    isLockLoading: boolean
  }[]
  const [lock, setLock] = useState<Lock | null>(null)
  const isStillLoading = results.some(({ isLockLoading }) => isLockLoading)
  const options = results
    .filter(({ isLockLoading }) => !isLockLoading)
    .map(({ lock }) => {
      return {
        key: lock.address,
        value: lock,
        label: lock.name,
      }
    })

  if (isStillLoading) {
    return (
      <Placeholder.Root>
        {Array.from({ length: 8 }).map((_, index) => (
          <Placeholder.Line key={index} />
        ))}
      </Placeholder.Root>
    )
  }
  if (options.length === 1 && options[0]) {
    return <AirdropFormForLock lock={options[0].value as Lock} />
  }
  return (
    <div className="mt-6 space-y-6">
      <Select
        onChange={(newValue: Lock) => {
          setLock(newValue)
        }}
        // @ts-expect-error Type 'Lock' is not assignable to type 'string | number'.
        options={options}
        description={
          <p>Select the contract for which you want to airdrop new keys.</p>
        }
      />
      {lock && <AirdropFormForLock lock={lock} />}
    </div>
  )
}

export const AirdropFormForLock = ({ lock }: { lock: Lock }) => {
  const { account, getWalletService } = useAuth()
  const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()

  const handleConfirm = async (items: AirdropMember[]) => {
    // Create metadata
    const users = items.map(({ wallet: userAddress, ...rest }) => {
      const data = omit(rest, [
        'manager',
        'neverExpire',
        'count',
        'expiration',
        'balance',
        'line',
      ])
      const metadata = Object.entries(data).reduce<Metadata>(
        (result, [key, value]) => {
          const [name, designation] = key.split('.')

          if (designation !== 'public') {
            // @ts-expect-error
            result.protected[name] = value
          } else {
            // @ts-expect-error
            result.public[name] = value
          }

          return result
        },
        {
          protected: {},
          public: {},
        }
      )

      const user = {
        userAddress,
        lockAddress: lock.address,
        metadata,
        network: lock.network,
      } as const

      return user
    })

    // Save metadata for users
    await updateUsersMetadata(users)

    const initialValue: Record<
      'recipients' | 'keyManagers' | 'expirations',
      string[]
    > = {
      recipients: [],
      keyManagers: [],
      expirations: [],
    }

    // Create options to pass to grant keys from the members
    const options = items.reduce((prop, item) => {
      let expiration

      if (item.expiration) {
        expiration = Math.floor(
          new Date(item.expiration).getTime() / 1000
        ).toString()
      } else if (item.neverExpire) {
        expiration = MAX_UINT
      } else if (lock!.expirationDuration == -1) {
        expiration = MAX_UINT
      } else {
        expiration = Math.floor(
          new Date(formatDate(lock!.expirationDuration)).getTime() / 1000
        ).toString()
      }

      for (const _ of Array.from({ length: item.count })) {
        prop.recipients.push(item.wallet)
        prop.expirations.push(expiration!)
        prop.keyManagers.push(item.manager || account!)
      }

      return prop
    }, initialValue)

    const walletService = await getWalletService(lock.network)

    // Grant keys
    await walletService
      .grantKeys(
        {
          ...options,
          lockAddress: lock.address,
        },
        {},
        (error) => {
          if (error) {
            throw error
          }
        }
      )
      .catch((error: any) => {
        console.error(error)
        throw new Error('We were unable to airdrop these memberships.')
      })

    ToastHelper.success(
      `Successfully granted ${options.recipients.length} keys to ${items.length} recipients`
    )
  }

  return (
    <div className="mt-2 space-y-6">
      <Tab.Group defaultIndex={0}>
        <Tab.List className="flex gap-6 p-2 border-b border-gray-400">
          {['Manual', 'Bulk'].map((text) => (
            <Tab
              key={text}
              className={({ selected }) => {
                return `font-medium ${selected ? 'text-brand-ui-primary' : ''}`
              }}
            >
              {text}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel>
            <AirdropManualForm lock={lock} onConfirm={handleConfirm} />
          </Tab.Panel>
          <Tab.Panel>
            <AirdropBulkForm lock={lock} onConfirm={handleConfirm} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export function AirdropKeysDrawer({
  locks,
  isOpen,
  setIsOpen,
}: {
  locks: PaywallLocksConfigType
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen} title="Airdrop Keys">
      <div className="mt-2 space-y-6">
        <AirdropForm locks={locks} />
      </div>
    </Drawer>
  )
}
