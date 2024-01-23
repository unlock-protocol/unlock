import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { useRouter } from 'next/router'
import { ActionBar } from '~/components/interface/locks/Manage'
import {
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

interface AttendeesProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const Attendees = ({ checkoutConfig, event }: AttendeesProps) => {
  console.log(event.requiresApproval)
  const [airdropKeys, setAirdropKeys] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [lockAddress, setLockAddress] = useState(
    checkoutConfig.config.locks
      ? Object.keys(checkoutConfig.config.locks)[0]
      : null
  )

  const { data: isOrganizer, isLoading: isLoadingLockManager } =
    useEventOrganizer({
      checkoutConfig,
    })

  const showNotManagerBanner = !isLoadingLockManager && !isOrganizer

  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
  })
  const [page, setPage] = useState(1)

  // Placeholders
  const lockNetwork = lockAddress
    ? checkoutConfig.config.locks[lockAddress].network
    : null

  if (showNotManagerBanner) {
    return <NotManagerBanner />
  }

  if (!lockAddress || !lockNetwork) {
    return null
  }

  return (
    <BrowserOnly>
      <AppLayout authRequired={true} showHeader={false}>
        <Button variant="borderless" onClick={() => router.back()}>
          <CloseIcon size={20} />
        </Button>

        <AirdropKeysDrawer
          isOpen={airdropKeys}
          setIsOpen={setAirdropKeys}
          lockAddress={lockAddress}
          network={lockNetwork}
        />
        <div className="min-h-screen bg-ui-secondary-200 pb-60 flex flex-col gap-4">
          <div className="flex flex-row-reverse gap-2">
            <Button onClick={() => setAirdropKeys(!airdropKeys)}>
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
              hideFilter={true}
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
                console.log(metadata)
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
                    MemberInfo={() => (
                      <AttendeeInfo
                        network={network}
                        lockAddress={lockAddress}
                        owner={owner}
                        token={token}
                        metadata={metadata}
                      />
                    )}
                    fieldsToShow={[
                      {
                        name: 'email',
                        label: 'Email',
                      },
                      {
                        name: 'fullname',
                        label: 'Full name',
                      },
                    ]}
                  />
                )
              }}
              NoMemberNoFilter={() => {
                return <p>No ticket minted from this contract yet!</p>
              }}
              NoMemberWithFilter={() => {
                return <p>No ticket matches your filter.</p>
              }}
            />
          </div>
        </div>
      </AppLayout>
    </BrowserOnly>
  )
}
export default Attendees
