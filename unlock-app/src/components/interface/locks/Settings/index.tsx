import { Tab } from '@headlessui/react'
import { ReactNode, useState } from 'react'
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

interface LockSettingsPageProps {
  lockAddress: string
  network: number
}

interface SidebarCardProps {
  src: string
  description?: ReactNode
  alt?: string
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

const SidebarCard = ({ src, alt, description }: SidebarCardProps) => {
  return (
    <div className="relative flex w-full bg-slate-200 rounded-2xl min-h-80">
      <div className="overflow-hidden rounded-2xl">
        <img
          className="object-cover w-full min-h-full bg-center"
          src={src}
          alt={alt ?? 'Sidebar image'}
        />
      </div>
      {description && (
        <span className="absolute block px-4 mt-4 text-lg text-gray-800 top-5">
          {description}
        </span>
      )}
    </div>
  )
}

const LockSettingsPage = ({ lockAddress, network }: LockSettingsPageProps) => {
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
      refetchInterval: 1000,
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

  const tabs: { label: string; children: ReactNode; sidebar?: ReactNode }[] = [
    {
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
      sidebar: (
        <SidebarCard
          src="/images/illustrations/img-general.svg"
          description="Change the name and ticker for your membership contract."
        />
      ),
    },
    {
      label: 'Membership Terms',
      children: (
        <SettingTerms
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          lock={lock}
          isLoading={isLoading}
        />
      ),
      sidebar: (
        <SidebarCard
          src="/images/illustrations/img-terms.svg"
          description="Membership Terms include the price, currency, duration, payment mechanisms... as well as cancellation terms and transfer fees."
        />
      ),
    },
    {
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
      sidebar: (
        <SidebarCard
          src="/images/illustrations/img-payment.svg"
          description="Payments settings lets you change the price and currency of your memberships, as well as enable credit cards and recurring payments."
        />
      ),
    },
    {
      label: 'Roles',
      children: (
        <SettingRoles
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          isLoading={isLoading}
        />
      ),
      sidebar: (
        <SidebarCard
          src="/images/illustrations/img-roles.svg"
          description={`Your Lock includes multiple roles, such as "Lock Manager", or "Verifiers". Here you can configure which addresses are assigned which roles.`}
        />
      ),
    },
    {
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
      sidebar: (
        <SidebarCard
          src="/images/illustrations/img-misc.svg"
          description="This section lets you configure referral fees, hooks and upgrade your lock to the latest version of the protocol."
        />
      ),
    },
  ]

  return (
    <>
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
              <div className="md:col-span-3">
                <Tab.Panels>
                  {tabs?.map(({ label, children }, index) => {
                    return (
                      <Tab.Panel className="flex flex-col gap-6" key={index}>
                        <h2 className="text-2xl font-bold md:text-4xl text-brand-dark">
                          {label}
                        </h2>
                        <div>{children}</div>
                      </Tab.Panel>
                    )
                  })}
                </Tab.Panels>
              </div>
              <div className="md:col-span-1">{tabs[selectedIndex].sidebar}</div>
            </div>
          </div>
        </div>
      </Tab.Group>
    </>
  )
}

export default LockSettingsPage
