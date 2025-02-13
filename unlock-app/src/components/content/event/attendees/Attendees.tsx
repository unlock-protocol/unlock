'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@unlock-protocol/ui'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
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
import MetadataCard from './MetadataCard'
import { useRouter } from 'next/navigation'
import { ApplicantInfo } from './ApplicantInfo'
import { AttendeeInfo } from './AttendeeInfo'
import { AttendeesActionsWrapper } from './AttendeesActions'
import { ApproveAttendeeModal } from './ApproveAttendeeModal'
import { DenyAttendeeModal } from './DenyAttendeeModal'

interface AttendeesProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const Attendees = React.memo(
  ({ checkoutConfig, event }: AttendeesProps) => {
    // Global states for modals, loading, pagination, etc.
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

    // Reset selections on page or filter change
    useEffect(() => {
      setAllSelected(false)
      setSelected({})
    }, [page, filters])

    const lockNetwork = useMemo(() => {
      return lockAddress
        ? checkoutConfig.config.locks[lockAddress].network
        : null
    }, [checkoutConfig.config.locks, lockAddress])

    // stable callbacks for modals, filters, etc.
    const handleSetAirdropKeysOpen = useCallback((isOpen: boolean) => {
      setAirdropKeys(isOpen)
    }, [])

    const handleSetApprovedAttendeesOpen = useCallback(() => {
      setApprovedAttendees([])
    }, [])

    const handleSetDeniedAttendeesOpen = useCallback(() => {
      setDeniedAttendees([])
    }, [])

    const handleSetLockAddress = useCallback((newLockAddress: string) => {
      setLockAddress(newLockAddress)
    }, [])

    const handleSetFilters = useCallback((newFilters: any) => {
      setFilters(newFilters)
    }, [])

    const handleSetPage = useCallback((newPage: number) => {
      setPage(newPage)
    }, [])

    const toggleAll = useCallback((keys: any) => {
      setAllSelected((prevAllSelected) => {
        const newAllSelected = !prevAllSelected
        setSelected(
          newAllSelected
            ? keys.reduce((acc: any, key: any) => {
                acc[key.keyholderAddress] = true
                return acc
              }, {})
            : {}
        )
        return newAllSelected
      })
    }, [])

    const bulkApprove = useCallback(
      (keys: any) => {
        const approved = keys.filter(
          (key: any) => selected[key.keyholderAddress]
        )
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

    const membersActions = useCallback(
      ({ keys, filters }: any) => {
        return AttendeesActionsWrapper({
          toggleAll,
          selected,
          bulkApprove,
          bulkDeny,
          allSelected,
        })({ keys, filters })
      },
      [toggleAll, selected, bulkApprove, bulkDeny, allSelected]
    )

    // Memoized MemberCardComponent (used by the render callback)
    const MemberCardComponent = React.memo(
      ({
        token,
        owner,
        expiration,
        version,
        metadata,
        lockAddress,
        network,
        expirationDuration,
        lockSettings,
        selected,
        setSelected,
      }: any) => {
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
                      setSelected((prevSelected: any) => ({
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
      }
    )
    MemberCardComponent.displayName = 'MemberCardComponent'

    // separate the header (filters, modals, buttons, etc.) from the member list
    const headerContent = useMemo(() => {
      if (showNotManagerBanner) {
        return <NotManagerBanner />
      }
      if (!lockAddress || !lockNetwork) {
        return null
      }
      return (
        <>
          <AirdropKeysDrawer
            isOpen={airdropKeys}
            setIsOpen={handleSetAirdropKeysOpen}
            locks={checkoutConfig.config.locks}
          />
          <ApproveAttendeeModal
            network={network!}
            isOpen={approvedAttendees.length > 0}
            setIsOpen={handleSetApprovedAttendeesOpen}
            lockAddress={lockAddress}
            attendees={approvedAttendees}
          />
          <DenyAttendeeModal
            network={network!}
            isOpen={deniedAttendees.length > 0}
            setIsOpen={handleSetDeniedAttendeesOpen}
            lockAddress={lockAddress}
            attendees={deniedAttendees}
          />
          <div className="flex justify-between items-center">
            <Button variant="borderless" onClick={() => router.back()}>
              <ArrowBackIcon size={20} />
            </Button>
            <Button
              onClick={() => {
                setAirdropKeys((prev) => !prev)
              }}
            >
              Airdrop tickets
            </Button>
          </div>
          <ActionBar
            page={page}
            lockAddress={lockAddress}
            network={lockNetwork!}
            isOpen={airdropKeys}
            setIsOpen={handleSetAirdropKeysOpen}
          />
          <FilterBar
            hideExpirationFilter={true}
            hideApprovalFilter={false}
            locks={checkoutConfig.config.locks}
            lockAddress={lockAddress}
            filters={filters}
            setLockAddress={handleSetLockAddress}
            setFilters={handleSetFilters}
            setLoading={setLoading}
            setPage={handleSetPage}
            page={page}
          />
        </>
      )
    }, [
      showNotManagerBanner,
      lockAddress,
      lockNetwork,
      airdropKeys,
      approvedAttendees,
      deniedAttendees,
      network,
      handleSetAirdropKeysOpen,
      handleSetApprovedAttendeesOpen,
      handleSetDeniedAttendeesOpen,
      checkoutConfig.config.locks,
      page,
      filters,
      router,
    ])

    // Memoized render callback for a MemberCard.
    // This callback is the only part that depends on the selection state.
    const renderMemberCard = useCallback(
      (props: any) => {
        return (
          <MemberCardComponent
            {...props}
            selected={selected}
            setSelected={setSelected}
          />
        )
      },
      [selected, setSelected]
    )

    return (
      <>
        {headerContent}
        <div className="flex flex-col gap-6">
          <Members
            lockAddress={lockAddress}
            network={lockNetwork!}
            filters={filters}
            loading={loading}
            setPage={handleSetPage}
            page={page}
            MemberCard={renderMemberCard}
            NoMemberNoFilter={() => (
              <p>No ticket minted from this contract yet!</p>
            )}
            NoMemberWithFilter={() => <p>No ticket matches your filter.</p>}
            MembersActions={membersActions}
          />
        </div>
      </>
    )
  }
)

Attendees.displayName = 'Attendees'

export default React.memo(Attendees)
