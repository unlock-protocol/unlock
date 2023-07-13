import { Tab } from '@headlessui/react'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SettingTerms } from './elements/SettingTerms'

import { SettingRoles } from './elements/SettingRoles'
import { useLockManager } from '~/hooks/useLockManager'
import { useAuth } from '~/contexts/AuthenticationContext'
import { addressMinify } from '~/utils/strings'
import { SettingHeader } from './elements/SettingHeader'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { SettingGeneral } from './elements/SettingGeneral'
import { SettingMisc } from './elements/SettingMisc'
import { SettingPayments } from './elements/SettingPayments'
import { SettingTab } from '~/pages/locks/settings'
import { SettingEmail } from './elements/SettingEmail'

interface LockSettingsPageProps {
  lockAddress: string
  network: number
  defaultTab?: SettingTab
}

const NotManagerBanner = () => {
  const { account } = useAuth()

  return (
    <div className="p-2 text-base text-center text-red-700 bg-red-100 border border-red-700 rounded-xl">
      You are connected as {addressMinify(account!)} and this address is not a
      manager for this lock. If you want to update details, please connect as
      lock manager.
    </div>
  )
}

export const SettingsContext = createContext<{
  setTab: (tab: number) => void
}>({
  setTab: () => {
    throw new Error('setTab is not passed')
  },
})

export const useTabSettings = () => {
  return useContext(SettingsContext)
}

const LockSettingsPage = ({
  lockAddress,
  network,
  defaultTab,
}: LockSettingsPageProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { isManager, isLoading: isLoadingManager } = useLockManager({
    lockAddress,
    network,
  })

  const web3Service = useWeb3Service()

  const getLock = async () => {
    return web3Service.getLock(lockAddress, network)
  }

  const { isLoading: isLoadingLock, data: lock } = useQuery(
    ['getLock', lockAddress, network],
    async () => await getLock(),
    {
      enabled: lockAddress?.length > 0 && network !== undefined,
    }
  )

  const [{ data: publicLockLatestVersion }, { data: publicLockVersion }] =
    useQueries({
      queries: [
        {
          queryKey: ['publicLockLatestVersion', network],
          queryFn: async () =>
            await web3Service.publicLockLatestVersion(network),
        },
        {
          queryKey: ['publicLockVersion', lockAddress, network],
          queryFn: async () =>
            await web3Service.publicLockVersion(lockAddress, network),
        },
      ],
    })

  const isLoading = isLoadingLock || isLoadingManager

  /**
   * Open default tab by id
   */
  useEffect(() => {
    if (!defaultTab) return
    const defaultTabIndex = tabs?.findIndex(({ id }) => id === defaultTab)
    if (defaultTabIndex === undefined) return

    setSelectedIndex(defaultTabIndex)
  }, [defaultTab])

  const tabs: {
    label: string
    description?: string
    id: SettingTab
    children: ReactNode
  }[] = [
    {
      id: 'general',
      label: 'General',
      children: (
        <SettingGeneral
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          isLoading={isLoading}
          lock={lock}
        />
      ),
    },
    {
      id: 'terms',
      label: 'Membership Terms',
      children: (
        <SettingTerms
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          lock={lock}
          isLoading={isLoading}
          publicLockVersion={publicLockVersion}
        />
      ),
      description:
        'Membership Terms include the price, currency, duration, payment mechanisms... as well as cancellation terms and transfer fees.',
    },
    {
      id: 'payments',
      label: 'Payments',
      children: (
        <SettingPayments
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          lock={lock}
          isLoading={isLoading}
        />
      ),
      description:
        'Payments settings lets you change the price and currency of your memberships, as well as enable credit cards and recurring payments.',
    },
    {
      id: 'roles',
      label: 'Roles',
      children: (
        <SettingRoles
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          isLoading={isLoading}
        />
      ),
      description: `Your Lock includes multiple roles, such as "Lock Manager", or "Verifiers". Here you can configure which addresses are assigned which roles.`,
    },
    {
      id: 'emails',
      label: 'Emails',
      children: (
        <SettingEmail
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          isLoading={isLoading}
        />
      ),
      description:
        "Customize the emails sent to users when they purchase your lock's membership NFTs.",
    },
    {
      id: 'advanced',
      label: 'Advanced',
      children: (
        <SettingMisc
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          isLoading={isLoading}
          publicLockLatestVersion={publicLockLatestVersion}
          publicLockVersion={publicLockVersion}
        />
      ),
      description:
        'This section lets you configure referral fees, hooks and upgrade your lock to the latest version of the protocol.',
    },
  ]

  return (
    <SettingsContext.Provider
      value={{
        setTab: setSelectedIndex,
      }}
    >
      {!isManager && !isLoading && (
        <div className="mb-2">
          <NotManagerBanner />
        </div>
      )}
      <SettingHeader
        lockAddress={lockAddress}
        network={network}
        isLoading={isLoading}
        lock={lock}
      />
      <Tab.Group
        vertical
        defaultIndex={1}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
      >
        <div className="flex flex-col gap-6 my-8 md:gap-10 md:grid md:grid-cols-5">
          <div className="md:col-span-1">
            <Tab.List className="flex flex-col gap-4">
              {tabs?.map(({ label }, index) => {
                const isActive = index === selectedIndex
                return (
                  <Tab
                    className={`px-4 py-2 text-lg font-bold text-left rounded-lg outline-none ${
                      isActive
                        ? 'bg-brand-primary text-brand-dark'
                        : 'text-gray-500'
                    }`}
                    key={index}
                  >
                    {label}
                  </Tab>
                )
              })}
            </Tab.List>
          </div>
          <div className="md:col-span-4">
            <div className="flex flex-col gap-10 md:grid md:grid-cols-4">
              <div className="md:col-span-4">
                <Tab.Panels>
                  {tabs?.map(({ label, description, children }, index) => {
                    return (
                      <Tab.Panel className="flex flex-col gap-10" key={index}>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-2xl font-bold md:text-4xl text-brand-dark">
                            {label}
                          </h2>
                          <span className="text-base text-brand-dark">
                            {description}
                          </span>
                        </div>
                        <div>{children}</div>
                      </Tab.Panel>
                    )
                  })}
                </Tab.Panels>
              </div>
            </div>
          </div>
        </div>
      </Tab.Group>
    </SettingsContext.Provider>
  )
}

export default LockSettingsPage
