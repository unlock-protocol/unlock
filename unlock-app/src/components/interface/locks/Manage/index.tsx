'use client'

import { MdOutlineTipsAndUpdates } from 'react-icons/md'
import { useState, useCallback } from 'react'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { Members } from './elements/Members'
import { TotalBar } from './elements/TotalBar'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'
import { NetworkWarning } from '~/components/interface/locks/Create/elements/NetworkWarning'
import {
  ApprovalStatus,
  ExpirationStatus,
  FilterBar,
} from './elements/FilterBar'
import Link from 'next/link'
import { useCentralizedLockData } from '~/hooks/useCentralizedLockData'
import TopActionBar from './elements/TopActionBar'
import ActionBar from './elements/ActionBar'
import NotManagerBanner from './elements/NotManagerBanner'
import LockSelection from './elements/LockSelection'
import NoMembersDisplay from './elements/NoMembersDisplay'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export interface ManageLockContentProps {
  network: string
  lockAddress: string
}

export const ManageLockContent = ({
  network: initialNetwork,
  lockAddress: initialLockAddress,
}: ManageLockContentProps) => {
  const { account: owner } = useAuthenticate()
  const [loading, setLoading] = useState(false)
  const [network, setNetwork] = useState<string>(initialNetwork || '')
  const [lockAddress, setLockAddress] = useState<string>(
    initialLockAddress || ''
  )

  console.log('network', network)
  const [airdropKeys, setAirdropKeys] = useState(false)

  const lockNetwork = network ? parseInt(network as string) : undefined

  const withoutParams = !(lockAddress && network)

  // Centralized lock data query - this will be used by all components
  // that need lock data, eliminating redundant subgraph requests
  const { data: centralizedLockData, isLoading: isLoadingLockData } =
    useCentralizedLockData(lockAddress, lockNetwork, owner, {
      staleTime: 1 * 60 * 1000, // 1 minute default stale time
    })

  const showNotManagerBanner =
    !isLoadingLockData && !centralizedLockData?.isManager

  // Filtering and pagination state
  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
    approval: ApprovalStatus.MINTED,
  })
  const [page, setPage] = useState(1)

  // Handler for toggling airdrop modal
  const toggleAirdropKeys = useCallback(() => {
    setAirdropKeys((current) => !current)
  }, [])

  if (!owner) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  return (
    <>
      <AirdropKeysDrawer
        isOpen={airdropKeys}
        setIsOpen={setAirdropKeys}
        locks={{
          [lockAddress]: {
            network: parseInt(network!, 10),
          },
        }}
      />
      <div className="min-h-screen bg-ui-secondary-200 pb-60">
        <LockSelection
          owner={owner}
          setLockAddress={setLockAddress}
          setNetwork={setNetwork}
          lockAddress={lockAddress}
          network={network}
        />
        {!withoutParams && (
          <div className="pt-9">
            <div className="flex flex-col gap-3 mb-7">
              <TopActionBar lockAddress={lockAddress} network={lockNetwork!} />
              <NetworkWarning network={lockNetwork!} />
              {showNotManagerBanner && <NotManagerBanner />}
            </div>
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14">
              <div className="lg:col-span-3">
                <LockDetailCard
                  lockAddress={lockAddress}
                  network={lockNetwork!}
                />
              </div>
              <div className="flex flex-col gap-6 lg:col-span-9">
                <TotalBar lockAddress={lockAddress} network={lockNetwork!} />

                {/* Display event URL notification if available */}
                {centralizedLockData?.eventDetails?.eventUrl && (
                  <div className="p-2 text-base text-center flex gap-2 items-center border rounded-xl">
                    <MdOutlineTipsAndUpdates size="24" />
                    <p>
                      This lock is used to sell{' '}
                      {centralizedLockData.eventDetails.eventName}. You can
                      update this event&apos;s{' '}
                      <Link
                        href={centralizedLockData.eventDetails.eventUrl || '#'}
                        className="underline"
                      >
                        settings directly
                      </Link>
                      .
                    </p>
                  </div>
                )}

                {/* Action and filter components */}
                <ActionBar
                  page={page}
                  lockAddress={lockAddress}
                  network={lockNetwork!}
                  isOpen={airdropKeys}
                  setIsOpen={setAirdropKeys}
                />
                <FilterBar
                  filters={filters}
                  setFilters={setFilters}
                  setLoading={setLoading}
                  setPage={setPage}
                  page={page}
                />

                {/* Members list component with centralized data */}
                <Members
                  lockAddress={lockAddress}
                  network={lockNetwork!}
                  filters={filters}
                  loading={loading || isLoadingLockData}
                  setPage={setPage}
                  page={page}
                  centralizedLockData={centralizedLockData}
                  NoMemberNoFilter={() => (
                    <NoMembersDisplay toggleAirdropKeys={toggleAirdropKeys} />
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ManageLockContent
