'use client'

import { MdOutlineTipsAndUpdates } from 'react-icons/md'
import { Button } from '@unlock-protocol/ui'
import { useState, useCallback, useEffect } from 'react'
import { ZeroAddress } from 'ethers'
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
  RenewalStatus,
} from './elements/FilterBar'
import { useLockManager } from '~/hooks/useLockManager'
import Link from 'next/link'
import { Picker } from '../../Picker'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useCentralizedLockData } from '~/hooks/useCentralizedLockData'
import { ActionBar } from '../elements/ActionBar'

import { NotManagerBanner } from '../Settings'
import { TopActionBar } from '../elements/TopActionBar'
import NoMembersDisplay from '../elements/NoMembersDisplay'

export const ManageLockContent = ({
  network: initialNetwork,
  lockAddress: initialLockAddress,
}: {
  network: string
  lockAddress: string
}) => {
  const { account: owner } = useAuthenticate()
  const [loading, setLoading] = useState(false)
  const [airdropKeys, setAirdropKeys] = useState(false)
  const [selectedLockAddress, setSelectedLockAddress] =
    useState(initialLockAddress)
  const [selectedNetwork, setSelectedNetwork] = useState(initialNetwork)

  const lockNetwork = selectedNetwork
    ? parseInt(selectedNetwork as string)
    : undefined
  const withoutParams = !selectedLockAddress && !selectedNetwork

  // Centralized lock data query - this will be used by all components
  // that need lock data, eliminating redundant subgraph requests
  const { data: centralizedLockData, isLoading: isLoadingLockData } =
    useCentralizedLockData(selectedLockAddress, lockNetwork, owner, {
      staleTime: 1 * 60 * 1000, // 1 minute default stale time
    })

  const { isManager, isPending: isLoadingLockManager } = useLockManager({
    lockAddress: selectedLockAddress,
    network: lockNetwork!,
  })

  const showNotManagerBanner = !isLoadingLockManager && !isManager

  // Filtering and pagination state
  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
    approval: ApprovalStatus.MINTED,
    renewal: RenewalStatus.ALL,
  })
  const [page, setPage] = useState(1)

  const lock = centralizedLockData?.lock
  const lockPrice = lock?.keyPrice ?? lock?.price
  const currencyAddress = lock?.currencyContractAddress ?? lock?.tokenAddress
  const lockVersion = lock?.publicLockVersion ?? lock?.version
  const isRecurringLock =
    !!lock &&
    Number(lockPrice) > 0 &&
    !!currencyAddress &&
    currencyAddress !== ZeroAddress &&
    Number(lockVersion) >= 11 &&
    lock?.expirationDuration !== -1 &&
    Number(lock?.expirationDuration) < 60 * 60 * 24 * 365 * 100

  useEffect(() => {
    if (!isRecurringLock) {
      setFilters((currentFilters) => {
        if (currentFilters.renewal === RenewalStatus.ALL) {
          return currentFilters
        }

        return {
          ...currentFilters,
          renewal: RenewalStatus.ALL,
        }
      })
    }
  }, [isRecurringLock])

  // Handler for toggling airdrop modal
  const toggleAirdropKeys = useCallback(() => {
    setAirdropKeys((current) => !current)
  }, [])

  if (!owner) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  // Component for selecting a lock when none is provided in the URL
  const LockSelection = () => {
    const resetLockSelection = () => {
      setSelectedLockAddress('')
      setSelectedNetwork('')
    }

    const hasLockSelected =
      selectedLockAddress?.length > 0 && selectedNetwork?.length > 0

    return (
      <div>
        {withoutParams ? (
          <>
            <h2 className="mb-2 text-lg font-bold text-brand-ui-primary">
              Select a lock to start managing it
            </h2>
            <div className="w-1/2">
              <Picker
                userAddress={owner!}
                onChange={({ lockAddress, network }) => {
                  if (lockAddress && network) {
                    setSelectedLockAddress(lockAddress)
                    setSelectedNetwork(`${network}`)
                  }
                }}
              />
            </div>
          </>
        ) : (
          !hasLockSelected && (
            <Button onClick={resetLockSelection} variant="outlined-primary">
              Change lock
            </Button>
          )
        )}
      </div>
    )
  }

  return (
    <>
      <AirdropKeysDrawer
        isOpen={airdropKeys}
        setIsOpen={setAirdropKeys}
        locks={{
          [selectedLockAddress]: {
            network: parseInt(selectedNetwork!, 10),
          },
        }}
      />
      <div className="min-h-screen bg-ui-secondary-200 pb-60">
        <LockSelection />
        {!withoutParams && (
          <div className="pt-9">
            <div className="flex flex-col gap-3 mb-7">
              <TopActionBar
                lockAddress={selectedLockAddress}
                network={lockNetwork!}
                isManager={isManager}
              />
              <NetworkWarning network={lockNetwork!} />
              {showNotManagerBanner && <NotManagerBanner />}
            </div>
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14">
              <div className="lg:col-span-3">
                <LockDetailCard
                  lockAddress={selectedLockAddress}
                  network={lockNetwork!}
                />
              </div>
              <div className="flex flex-col gap-6 lg:col-span-9">
                <TotalBar
                  lockAddress={selectedLockAddress}
                  network={lockNetwork!}
                />

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
                  lockAddress={selectedLockAddress}
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
                  showRenewalFilter={isRecurringLock}
                />

                {/* Members list component with centralized data */}
                <Members
                  lockAddress={selectedLockAddress}
                  network={lockNetwork!}
                  filters={filters}
                  loading={loading || isLoadingLockData}
                  setPage={setPage}
                  page={page}
                  centralizedLockData={centralizedLockData}
                  NoMemberNoFilter={() => (
                    <NoMembersDisplay
                      toggleAirdropKeys={toggleAirdropKeys}
                      isManager={isManager}
                    />
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
