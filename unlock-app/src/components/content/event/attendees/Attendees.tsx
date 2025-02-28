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
import { SelectionProvider, useSelection } from './SelectionContext'

interface AttendeesProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

// Separate component for the content to use the selection context
const AttendeesContent = ({ checkoutConfig, event }: AttendeesProps) => {
  const { setSelected, clearSelections, isSelected } = useSelection()
  const [airdropKeys, setAirdropKeys] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allSelected, setAllSelected] = useState(false)
  const [approvedAttendees, setApprovedAttendees] = useState<any[]>([])
  const [deniedAttendees, setDeniedAttendees] = useState<any[]>([])
  const router = useRouter()

  const initialLockAddress = useMemo(() => {
    const keys = Object.keys(checkoutConfig.config.locks)
    return keys.length > 0 ? keys[0] : ''
  }, [checkoutConfig.config.locks])

  const [lockAddress, setLockAddress] = useState(initialLockAddress)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
    approval: event.requiresApproval
      ? ApprovalStatus.PENDING
      : ApprovalStatus.MINTED,
  })

  // Reset selections on page or filter change
  useEffect(() => {
    clearSelections()
    setAllSelected(false)
  }, [page, filters, clearSelections])

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

  // Updated bulk action handlers to use SelectionContext
  const toggleAll = useCallback(
    (keys: any[]) => {
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
    },
    [setSelected]
  )

  const bulkApprove = useCallback(
    (keys: any[]) => {
      const approved = keys.filter((key) => isSelected(key.keyholderAddress))
      setApprovedAttendees(approved)
    },
    [isSelected]
  )

  const bulkDeny = useCallback(
    (keys: any[]) => {
      const denied = keys.filter((key) => isSelected(key.keyholderAddress))
      setDeniedAttendees(denied)
    },
    [isSelected]
  )

  // Memoized callbacks
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

  // Memoized MemberCard render function
  const renderMemberCard = useCallback((props: any) => {
    if (!props.token) {
      return (
        <MemberCard
          {...props}
          MetadataCard={
            <MetadataCard
              metadata={props.metadata}
              network={props.network}
              data={{ lockAddress: props.lockAddress, token: props.token }}
            />
          }
          MemberInfo={() => (
            <ApplicantInfo
              network={props.network}
              lockAddress={props.lockAddress}
              owner={props.owner}
              metadata={props.metadata}
            />
          )}
        />
      )
    }
    return (
      <MemberCard
        {...props}
        MetadataCard={
          <MetadataCard
            metadata={props.metadata}
            network={props.network}
            data={{ lockAddress: props.lockAddress, token: props.token }}
          />
        }
        MemberInfo={() => (
          <AttendeeInfo
            network={props.network}
            lockAddress={props.lockAddress}
            owner={props.owner}
            token={props.token}
            metadata={props.metadata}
          />
        )}
      />
    )
  }, [])

  // Memoized members actions
  const membersActions = useCallback(
    ({ keys, filters }: any) => {
      return AttendeesActionsWrapper({
        toggleAll,
        bulkApprove,
        bulkDeny,
        allSelected,
      })({ keys, filters })
    },
    [toggleAll, bulkApprove, bulkDeny, allSelected]
  )

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

      {showNotManagerBanner ? (
        <NotManagerBanner />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <Button variant="borderless" onClick={() => router.back()}>
              <ArrowBackIcon size={20} />
            </Button>
            <Button onClick={() => setAirdropKeys(true)}>
              Airdrop tickets
            </Button>
          </div>
          <ActionBar
            page={page}
            lockAddress={lockAddress}
            network={network!}
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
          <div className="flex flex-col gap-6">
            <Members
              lockAddress={lockAddress}
              network={network!}
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
      )}
    </>
  )
}

// Main Attendees component wrapped with SelectionProvider
export const Attendees = React.memo(
  ({ checkoutConfig, event }: AttendeesProps) => {
    return (
      <SelectionProvider>
        <AttendeesContent checkoutConfig={checkoutConfig} event={event} />
      </SelectionProvider>
    )
  }
)

Attendees.displayName = 'Attendees'

export default Attendees
