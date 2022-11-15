import { Tab } from '@headlessui/react'
import { ReactNode, useState } from 'react'
import { MembershipTerms } from './elements/MembershipTerms'

import { Roles } from './elements/Roles'
import { useLockManager } from '~/hooks/useLockManager'
import { useAuth } from '~/contexts/AuthenticationContext'
import { addressMinify } from '~/utils/strings'
import { SettingHeader } from './elements/SettingHeader'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface LockSettingsPageProps {
  lockAddress: string
  network: string
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
    <div className="relative w-full h-80 bg-slate-200 rounded-2xl">
      <div className="overflow-hidden rounded-2xl">
        <img
          className="object-cover w-full h-24 bg-center md:h-80"
          src={src}
          alt={alt ?? 'Sidebar image'}
        />
      </div>
      {description && (
        <span className="absolute px-4 mt-4 text-lg text-gray-800 top-5">
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
    network: parseInt(network!, 10),
  })

  const web3Service = useWeb3Service()

  const getLock = async () => {
    return web3Service.getLock(lockAddress, parseInt(network))
  }

  const { isLoading: isLoadingLock, data: lock } = useQuery(
    ['getLock', lockAddress, network],
    async () => await getLock(),
    {
      enabled: lockAddress?.length > 0 && network?.length > 0,
      refetchInterval: 1000,
    }
  )

  const isLoading = isLoadingLock || isLoadingManager

  const tabs: { label: string; children: ReactNode; sidebar?: ReactNode }[] = [
    {
      label: 'Membership Terms',
      children: (
        <MembershipTerms
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
          description="Membership Terms ipsum dolor sit amet consectetur. Magna neque facilisis eu feugiat consectetur congue."
        />
      ),
    },
    {
      label: 'Roles',
      children: (
        <Roles
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
        />
      ),
      sidebar: (
        <SidebarCard
          src="/images/illustrations/img-roles.svg"
          description="Roles ipsum dolor sit amet consectetur. Your Lock includes multiple roles, such as "Lock Manager", or "Verifiers". Here you can configure which addresses are assigned which roles."
        />
      ),
    },
    {
      label: 'General',
      children: <span></span>,
      sidebar: (
        <SidebarCard
          src="/images/illustrations/img-general.svg"
          description="Change the name and ticker for your membership contract."
        />
      ),
    },
    {
      label: 'Misc.',
      children: <span></span>,
      sidebar: (
        <SidebarCard
          src="/images/illustrations/img-misc.svg"
          description="Misc ipsum dolor sit amet consectetur. Magna neque facilisis eu feugiat consectetur congue."
        />
      ),
    },
  ]

  return (
    <>
      {!isManager && !isLoading && <NotManagerBanner />}
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
        <div className="grid grid-cols-5 gap-10 my-8">
          <div className="col-span-1">
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
          <div className="col-span-4">
            <div className="grid grid-cols-4 gap-10">
              <div className="col-span-3">
                <Tab.Panels>
                  {tabs?.map(({ label, children }, index) => {
                    return (
                      <Tab.Panel className="flex flex-col gap-6" key={index}>
                        <h2 className="text-4xl font-bold text-brand-dark">
                          {label}
                        </h2>
                        <div>{children}</div>
                      </Tab.Panel>
                    )
                  })}
                </Tab.Panels>
              </div>
              <div className="col-span-1">{tabs[selectedIndex].sidebar}</div>
            </div>
          </div>
        </div>
      </Tab.Group>
    </>
  )
}

export default LockSettingsPage
