import { Drawer, Placeholder } from '@unlock-protocol/ui'
import { Tab } from '@headlessui/react'
import { AirdropManualForm } from './AirdropManualForm'
import { AirdropBulkForm } from './AirdropBulkForm'
import { AirdropMember } from './AirdropElements'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { useAuth } from '~/contexts/AuthenticationContext'
import { MAX_UINT } from '~/constants'
import { formatDate } from '~/utils/lock'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { omit } from 'lodash'
import { useLockData } from '~/hooks/useLockData'

dayjs.extend(customParseFormat)

type Metadata = Record<'public' | 'protected', Record<string, string>>

export interface Props {
  lockAddress: string
  network: number
  isOpen: boolean
  setIsOpen(value: boolean): void
}

export function AirdropKeysDrawer({
  lockAddress,
  network,
  isOpen,
  setIsOpen,
}: Props) {
  const storageService = useStorageService()
  const walletService = useWalletService()
  const { account } = useAuth()

  const { lock: lockData, isLockLoading: isLockDataLoading } = useLockData({
    lockAddress,
    network,
  })

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
            result.protected[name] = value
          } else {
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
        lockAddress,
        metadata,
      } as const

      return user
    })

    // Save metadata for users
    await storageService.submitMetadata(users, network)

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
      let expiration = Math.floor(
        new Date(
          item.expiration || formatDate(lockData!.expirationDuration)
        ).getTime() / 1000
      ).toString()

      // if item never expires
      if (item.neverExpire) {
        expiration = MAX_UINT
      }

      for (const _ of Array.from({ length: item.count })) {
        prop.recipients.push(item.wallet)
        prop.expirations.push(expiration!)
        prop.keyManagers.push(item.manager || account!)
      }

      return prop
    }, initialValue)

    // Grant keys
    await walletService
      .grantKeys(
        {
          ...options,
          lockAddress,
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
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen} title="Airdrop Keys">
      <div className="mt-2 space-y-6">
        {isLockDataLoading ? (
          <Placeholder.Root>
            {Array.from({ length: 8 }).map((_, index) => (
              <Placeholder.Line key={index} />
            ))}
          </Placeholder.Root>
        ) : (
          <Tab.Group defaultIndex={0}>
            <Tab.List className="flex gap-6 p-2 border-b border-gray-400">
              {['Manual', 'Bulk'].map((text) => (
                <Tab
                  key={text}
                  className={({ selected }) => {
                    return `font-medium ${
                      selected ? 'text-brand-ui-primary' : ''
                    }`
                  }}
                >
                  {text}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-6">
              <Tab.Panel>
                <AirdropManualForm lock={lockData!} onConfirm={handleConfirm} />
              </Tab.Panel>
              <Tab.Panel>
                <AirdropBulkForm lock={lockData!} onConfirm={handleConfirm} />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
    </Drawer>
  )
}
