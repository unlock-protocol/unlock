import { Drawer } from '@unlock-protocol/ui'
import { Tab } from '@headlessui/react'
import { AirdropManualForm } from './AirdropManualForm'
import { AirdropBulkForm } from './AirdropBulkForm'
import { AirdropMember } from './AirdropElements'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { useQuery } from 'react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Lock } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { MAX_UINT } from '~/constants'

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
  const web3Service = useWeb3Service()
  const { account } = useAuth()
  const { data: lockData, isLoading: isLockDataLoading } = useQuery<Lock>(
    ['lock', lockAddress, network],
    () => {
      return web3Service.getLock(lockAddress, network)
    }
  )

  const handleConfirm = async (items: AirdropMember[]) => {
    try {
      // Create metadata
      const users = items.map(({ recipient: userAddress, email }) => {
        const user = {
          userAddress,
          lockAddress,
          metadata: {
            public: {},
            protected: {} as Record<string, string>,
          },
        }
        if (email) {
          user.metadata.protected.email = email
        }
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
        const expiration = item.expiration
          ? Math.floor(new Date(item.expiration).getTime() / 1000).toString()
          : MAX_UINT

        prop.recipients.push(item.recipient)
        prop.expirations.push(expiration)

        prop.keyManagers.push(item.manager || account!)
        return prop
      }, initialValue)

      // Grant keys
      await walletService.grantKeys(
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
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
    }
  }
  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Airdrop Keys"
      description="To any single address, or bulk airdrop Keys to a group of members. Set up a custom expiration date and send over email notification."
    >
      <div className="mt-2 space-y-6">
        <a
          href="/templates/airdrop.csv"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-brand-ui-primary"
        >
          Download .CSV template
        </a>
        <div>
          {isLockDataLoading ? null : (
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
                  <AirdropManualForm
                    lock={lockData!}
                    onConfirm={handleConfirm}
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <AirdropBulkForm lock={lockData!} onConfirm={handleConfirm} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          )}
        </div>
      </div>
    </Drawer>
  )
}
