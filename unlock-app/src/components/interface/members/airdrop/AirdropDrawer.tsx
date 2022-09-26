import { Drawer } from '@unlock-protocol/ui'
import { Tab } from '@headlessui/react'
import { AirdropManualForm } from './AirdropManualForm'
import { AirdropBulkForm } from './AirdropBulkForm'
import { AirdropMember } from './AirdropElements'
import { useStorageService } from '~/utils/withStorageService'
import { getAddressForName } from '~/hooks/useEns'
import { useWalletService } from '~/utils/withWalletService'

export interface Props {
  lock: {
    address: string
    network: number
  }
  isOpen: boolean
  setIsOpen(value: boolean): void
}

export function AirdropKeysDrawer({ lock, isOpen, setIsOpen }: Props) {
  const storageService = useStorageService()
  const walletService = useWalletService()

  const handleConfirm = async (items: AirdropMember[]) => {
    // Create metadata
    const users = items.map(({ recipient: userAddress, email }) => {
      const user = {
        userAddress,
        metadata: {
          public: {},
          protected: {} as Record<string, string>,
        },
        lockAddress: lock!.address,
      }
      if (email) {
        user.metadata.protected.email = email
      }
      return user
    })
    // Save metadata for users
    await storageService.submitMetadata(users, lock.network)

    // Grant keys
    await walletService.grantKeys(
      {
        lockAddress: lock.address,
        recipients: [],
        keyManagers: [],
        expirations: [],
      },
      {},
      (error, hash) => {}
    )
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
                <AirdropManualForm onConfirm={handleConfirm} />
              </Tab.Panel>
              <Tab.Panel>
                <AirdropBulkForm />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </Drawer>
  )
}
