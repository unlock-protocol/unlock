'use client'
import { Button } from '@unlock-protocol/ui'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ActionBar } from '~/components/interface/locks/Manage'
import {
  ApprovalStatus,
  ExpirationStatus,
  FilterBar,
} from '~/components/interface/locks/Manage/elements/FilterBar'
import { Members } from '~/components/interface/locks/Manage/elements/Members'
import { NotManagerBanner } from '~/components/interface/locks/Settings'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'
import { useEventOrganizer } from '~/hooks/useEventOrganizer'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { MemberCard } from '~/components/interface/locks/Manage/elements/MemberCard'
import { AttendeeInfo } from './AttendeeInfo'
import { ApplicantInfo } from './ApplicantInfo'
import { AttendeesActionsWrapper } from './AttendeesActions'
import { ApproveAttendeeModal } from './ApproveAttendeeModal'
import { DenyAttendeeModal } from './DenyAttendeeModal'
import MetadataCard from './MetadataCard'

interface AttendeesProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const Attendees = ({ checkoutConfig, event }: AttendeesProps) => {
  const [airdropKeys, setAirdropKeys] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({})
  const [allSelected, setAllSelected] = useState(false)
  const [approvedAttendees, setApprovedAttendees] = useState<any[]>([])
  const [deniedAttendees, setDeniedAttendees] = useState<any[]>([])
  const router = useRouter()

  const initialLockAddress = useMemo(() => {
    const keys = Object.keys(checkoutConfig.config.locks)
    return keys.length > 0 ? keys[0] : ''
  }, [checkoutConfig.config.locks])

  const [lockAddress, setLockAddress] = useState(initialLockAddress)

  const network = useMemo(() => {
    return (
      checkoutConfig.config.locks[lockAddress]?.network ||
      checkoutConfig.config.network
    )
  }, [checkoutConfig.config, lockAddress])

  const { data: isOrganizer, isLoading: isLoadingLockManager } =
    useEventOrganizer({
      checkoutConfig,
    })

  const showNotManagerBanner = !isLoadingLockManager && !isOrganizer

  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
    approval: event.requiresApproval
      ? ApprovalStatus.PENDING
      : ApprovalStatus.MINTED,
  })
  const [page, setPage] = useState(1)

  // Reset selected keys when changing page or filters
  useEffect(() => {
    setAllSelected(false)
    setSelected({})
  }, [page, filters])

  // Placeholders
  const lockNetwork = useMemo(() => {
    return lockAddress ? checkoutConfig.config.locks[lockAddress].network : null
  }, [checkoutConfig.config.locks, lockAddress])

  // Define callbacks and memoized values before any conditional rendering
  const toggleAll = useCallback((keys: any) => {
    setAllSelected((prevAllSelected) => {
      const newAllSelected = !prevAllSelected
      if (newAllSelected) {
        const newSelected = keys.reduce((acc: any, key: any) => {
          acc[key.keyholderAddress] = true
          return acc
        }, {})
        setSelected(newSelected)
      } else {
        setSelected({})
      }
      return newAllSelected
    })
  }, [])

  const bulkApprove = useCallback(
    (keys: any) => {
      const approved = keys.filter((key: any) => selected[key.keyholderAddress])
      setApprovedAttendees(approved)
    },
    [selected]
  )

  const bulkDeny = useCallback(
    (keys: any) => {
      const denied = keys.filter((key: any) => selected[key.keyholderAddress])
      setDeniedAttendees(denied)
    },
    [selected]
  )

  // Memoize MembersActions to prevent unnecessary re-renders
  const membersActions = useMemo(
    () =>
      AttendeesActionsWrapper({
        toggleAll,
        selected,
        bulkApprove,
        bulkDeny,
        allSelected,
      }),
    [toggleAll, selected, bulkApprove, bulkDeny, allSelected]
  )

  return (
    <>
      {showNotManagerBanner && <NotManagerBanner />}

      {!showNotManagerBanner && (!lockAddress || !lockNetwork) && null}

      {/* Render the main content only if the user is a manager and lockAddress & lockNetwork are available */}
      {!showNotManagerBanner && lockAddress && lockNetwork && (
        <>
          <AirdropKeysDrawer
            isOpen={airdropKeys}
            setIsOpen={setAirdropKeys}
            locks={checkoutConfig.config.locks}
          />
          <ApproveAttendeeModal
            network={network!}
            isOpen={approvedAttendees.length > 0}
            setIsOpen={() => setApprovedAttendees([])}
            lockAddress={lockAddress}
            attendees={approvedAttendees}
          />

          <DenyAttendeeModal
            network={network!}
            isOpen={deniedAttendees.length > 0}
            setIsOpen={() => setDeniedAttendees([])}
            lockAddress={lockAddress}
            attendees={deniedAttendees}
          />
          <div className="min-h-screen bg-ui-secondary-200 pb-60 flex flex-col gap-4">
            <div className="flex flex-row-reverse gap-2">
              <Button onClick={() => setAirdropKeys((prev) => !prev)}>
                Airdrop tickets
              </Button>
            </div>
            <div className="flex flex-col gap-6 lg:col-span-9">
              <ActionBar
                page={page}
                lockAddress={lockAddress}
                network={lockNetwork!}
                isOpen={airdropKeys}
                setIsOpen={setAirdropKeys}
              />
              <FilterBar
                hideExpirationFilter={true}
                hideApprovalFilter={false} // We could hide this if the event doesn't require approval AND the maxNumberOfKeys > 0
                locks={checkoutConfig.config.locks}
                lockAddress={lockAddress}
                filters={filters}
                setLockAddress={setLockAddress}
                setFilters={setFilters}
                setLoading={setLoading}
                setPage={setPage}
                page={page}
              />
              <Members
                lockAddress={lockAddress}
                network={lockNetwork}
                filters={filters}
                loading={loading}
                setPage={setPage}
                page={page}
                MemberCard={({
                  token,
                  owner,
                  expiration,
                  version,
                  metadata,
                  lockAddress,
                  network,
                  expirationDuration,
                  lockSettings,
                }) => {
                  return (
                    <MemberCard
                      token={token}
                      owner={owner}
                      expiration={expiration}
                      showExpiration={false}
                      version={version}
                      metadata={metadata}
                      lockAddress={lockAddress!}
                      network={network}
                      expirationDuration={expirationDuration}
                      lockSettings={lockSettings}
                      MetadataCard={
                        <MetadataCard
                          metadata={metadata}
                          network={network}
                          data={{ lockAddress, token }}
                        />
                      }
                      MemberInfo={() => {
                        if (!token) {
                          return (
                            <ApplicantInfo
                              network={network}
                              lockAddress={lockAddress}
                              owner={owner}
                              metadata={metadata}
                              isSelected={!!selected[owner]}
                              setIsSelected={() => {
                                setSelected((prevSelected) => ({
                                  ...prevSelected,
                                  [owner]: !prevSelected[owner],
                                }))
                              }}
                            />
                          )
                        }
                        return (
                          <AttendeeInfo
                            network={network}
                            lockAddress={lockAddress}
                            owner={owner}
                            token={token}
                            metadata={metadata}
                          />
                        )
                      }}
                    />
                  )
                }}
                NoMemberNoFilter={() => {
                  return <p>No ticket minted from this contract yet!</p>
                }}
                NoMemberWithFilter={() => {
                  return <p>No ticket matches your filter.</p>
                }}
                MembersActions={membersActions}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
export default Attendees
