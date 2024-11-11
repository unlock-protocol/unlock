'use client'

import { MdOutlineTipsAndUpdates } from 'react-icons/md'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, Icon } from '@unlock-protocol/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { Members } from './elements/Members'
import { TotalBar } from './elements/TotalBar'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'
import { NetworkWarning } from '~/components/interface/locks/Create/elements/NetworkWarning'
import {
  ApprovalStatus,
  ExpirationStatus,
  FilterBar,
} from './elements/FilterBar'
import { buildCSV } from '~/utils/csv'
import FileSaver from 'file-saver'
import { FaFileCsv as CsvIcon } from 'react-icons/fa'
import { useLockManager } from '~/hooks/useLockManager'
import { addressMinify } from '~/utils/strings'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import {
  TbTools as ToolsIcon,
  TbSettings as SettingsIcon,
} from 'react-icons/tb'
import { CgWebsite as WebsiteIcon } from 'react-icons/cg'
import { FaRegEdit as EditIcon } from 'react-icons/fa'
import { BiRightArrow as RightArrowIcon } from 'react-icons/bi'
import { TbPlant as PlantIcon } from 'react-icons/tb'
import { IconType } from 'react-icons'
import { Picker } from '../../Picker'
import { locksmith } from '~/config/locksmith'
import { useMetadata } from '~/hooks/metadata'
import { getLockTypeByMetadata } from '@unlock-protocol/core'
import { ImageBar } from './elements/ImageBar'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface ActionBarProps {
  lockAddress: string
  network: number
  setIsOpen: (open: boolean) => void
  isOpen: boolean
  page: number
}

interface TopActionBarProps {
  lockAddress: string
  network: number
}

interface DownloadOptions {
  fileName?: string
  cols: string[]
  metadata: any[]
}

export function downloadAsCSV({
  cols,
  metadata,
  fileName = 'members.csv',
}: DownloadOptions) {
  const csv = buildCSV(cols, metadata)

  const blob = new Blob([csv], {
    type: 'data:text/csv;charset=utf-8',
  })
  FileSaver.saveAs(blob, fileName)
}

export const ActionBar = ({ lockAddress, network }: ActionBarProps) => {
  const { isPending: isLoadingMetadata, data: metadata } = useMetadata({
    lockAddress,
    network,
  })

  const { isEvent } = getLockTypeByMetadata(metadata)
  const [keysJobId, setKeysJobId] = useState<string | null>(null)
  const [isKeysJobLoading, setIsKeysJobLoading] = useState<boolean>(false)

  const onDownloadCsvMutation = useMutation({
    mutationFn: async () => {
      ToastHelper.success(
        'It may take a few minutes for the file to be generated. Please do not close this page'
      )
      const response = await locksmith.exportKeys(
        network,
        lockAddress,
        '',
        'owner',
        'all',
        'minted'
      )
      if (response.status === 200 && response.data.jobId) {
        setKeysJobId(response.data.jobId)
        setIsKeysJobLoading(true)
      } else {
        console.error('Failed to start download job', response)
        ToastHelper.error(`Failed to start download job: ${response}`)
      }
    },
    onError: (error) => {
      ToastHelper.error(`Failed to download members list: ${error}`)
      console.error('Failed to download members list', error)
      setIsKeysJobLoading(false)
    },
  })

  useEffect(() => {
    let intervalId: any = null

    const fetchKeysJob = async () => {
      if (!keysJobId) return

      const response = await locksmith.getExportedKeys(
        network,
        lockAddress,
        keysJobId
      )
      if (response.status != 200) {
        return
      }

      clearInterval(intervalId)
      setIsKeysJobLoading(false)

      const members = response.data
      const cols: { [key: string]: boolean } = { token: true, data: false }
      if (members.keys) {
        for (let i = 0; i < members.keys.length; i++) {
          Object.keys(members.keys[i]).forEach((key) => {
            cols[key] = true
          })
        }
      }
      delete cols.data
      downloadAsCSV({
        cols: Object.keys(cols),
        metadata: members.keys as any[],
      })
    }

    if (isKeysJobLoading) {
      intervalId = setInterval(fetchKeysJob, 2000)
    }

    return () => clearInterval(intervalId)
  }, [keysJobId, isKeysJobLoading])

  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  return (
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold text-brand-ui-primary">
        {isEvent ? 'Attendees' : 'Members'}
      </span>
      {isManager && (
        <div className="flex gap-2">
          <Button
            variant="outlined-primary"
            size="small"
            disabled={isLoadingMetadata || isKeysJobLoading}
            loading={onDownloadCsvMutation.isPending || isKeysJobLoading}
            iconLeft={<CsvIcon className="text-brand-ui-primary" size={16} />}
            onClick={() => onDownloadCsvMutation.mutate()}
          >
            Download {isEvent ? 'attendee' : 'member'} list
          </Button>
        </div>
      )}
    </div>
  )
}

interface PopoverItemProps {
  label: string
  description?: string
  icon?: IconType
  onClick?: any
}

const PopoverItem = ({
  label,
  description,
  icon,
  ...props
}: PopoverItemProps) => {
  return (
    <>
      <div className="flex gap-3 cursor-pointer" {...props}>
        {icon && (
          <div className="w-4 pt-1">
            <Icon className="text-brand-ui-primary" icon={icon} size={20} />
          </div>
        )}
        <div className="flex flex-col text-left">
          <span className="text-base font-bold text-brand-ui-primary">
            {label}
          </span>
          {description && (
            <span className="text-xs text-brand-dark">{description}</span>
          )}
        </div>
      </div>
    </>
  )
}

const ToolsMenu = ({ lockAddress, network }: TopActionBarProps) => {
  const [airdropKeys, setAirdropKeys] = useState(false)
  const DEMO_URL = `/demo?network=${network}&lock=${lockAddress}`
  const metadataPageUrl = `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
  const checkoutLink = '/locks/checkout-url'

  const { isManager } = useLockManager({
    lockAddress,
    network: network!,
  })

  return (
    <>
      <AirdropKeysDrawer
        isOpen={airdropKeys}
        setIsOpen={setAirdropKeys}
        locks={{
          [lockAddress]: {
            network: network,
          },
        }}
      />

      <div className="">
        <Popover className="relative">
          <>
            <Popover.Button className="outline-none ring-0">
              <Button as="div" role="button">
                <div className="flex items-center gap-2">
                  <Icon icon={ToolsIcon} size={20} />
                  <span>Tools</span>
                </div>
              </Button>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-0 z-[5] max-w-sm px-4 mt-3 transform w-80">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid gap-8 bg-white p-7">
                    <a href={DEMO_URL} target="_blank" rel="noreferrer">
                      <PopoverItem
                        label="Preview"
                        description="Preview the checkout experience"
                        icon={WebsiteIcon}
                      />
                    </a>
                    <Link href={checkoutLink} className="text-left">
                      <PopoverItem
                        label="Checkout URLs"
                        description="Customize your member's purchase journey"
                        icon={RightArrowIcon}
                      />
                    </Link>
                    <PopoverItem
                      label="Airdrop Keys"
                      description="Send memberships to your members"
                      onClick={() => setAirdropKeys(!airdropKeys)}
                      icon={PlantIcon}
                    />
                    {isManager && (
                      <>
                        <Link href={metadataPageUrl}>
                          <PopoverItem
                            label="Edit NFT Properties"
                            description="Edit & update NFT metadata that will display in platforms such as Opensea"
                            icon={EditIcon}
                          />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        </Popover>
      </div>
    </>
  )
}

export const TopActionBar = ({ lockAddress, network }: TopActionBarProps) => {
  const router = useRouter()

  const { isManager } = useLockManager({
    lockAddress,
    network,
  })
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="borderless" aria-label="arrow back">
          <ArrowBackIcon
            size={20}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
        </Button>
        <div className="flex gap-3">
          {isManager && (
            <Button
              onClick={() => {
                router.push(
                  `/locks/settings?address=${lockAddress}&network=${network}`
                )
              }}
            >
              <div className="flex items-center gap-2">
                <Icon icon={SettingsIcon} size={20} />
                <span>Settings</span>
              </div>
            </Button>
          )}

          <ToolsMenu lockAddress={lockAddress} network={network} />
        </div>
      </div>
    </>
  )
}

const NotManagerBanner = () => {
  const { account } = useAuthenticate()

  return (
    <div className="p-2 text-base text-center text-red-700 bg-red-100 border border-red-700 rounded-xl">
      You are connected as {addressMinify(account!)} and this address is not a
      manager for this lock. If you want to update details, please connect as
      lock manager.
    </div>
  )
}

export const ManageLockContent = () => {
  const { account: owner } = useAuthenticate()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [network, setNetwork] = useState<string>(
    (searchParams.get('network') as string) ?? ''
  )
  const [lockAddress, setLockAddress] = useState<string>(
    (searchParams.get('address') as string) ?? ''
  )
  const [airdropKeys, setAirdropKeys] = useState(false)

  const lockNetwork = network ? parseInt(network as string) : undefined

  const withoutParams =
    !searchParams.get('lockAddress') &&
    !searchParams.get('network') &&
    !(lockAddress && network)

  const { isManager, isPending: isLoadingLockManager } = useLockManager({
    lockAddress,
    network: lockNetwork!,
  })

  const showNotManagerBanner = !isLoadingLockManager && !isManager

  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
    approval: ApprovalStatus.MINTED,
  })
  const [page, setPage] = useState(1)

  const { data: eventData } = useQuery({
    queryKey: ['getEventForLock', lockAddress, network],
    queryFn: async () => {
      const { data: eventDetails } = await locksmith.getEventDetails(
        Number(network),
        lockAddress
      )
      return eventDetails
    },
  })

  if (!owner) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  const toggleAirdropKeys = () => {
    setAirdropKeys(!airdropKeys)
  }

  const LockSelection = () => {
    const resetLockSelection = () => {
      setLockAddress('')
      setNetwork('')
    }

    const hasQuery =
      (searchParams.get('address') as string)?.length > 0 &&
      (searchParams.get('network') as string)?.length > 0

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
                    setLockAddress(lockAddress)
                    setNetwork(`${network}`)
                  }
                }}
              />
            </div>
          </>
        ) : (
          !hasQuery && (
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
          [lockAddress]: {
            network: parseInt(network!, 10),
          },
        }}
      />
      <div className="min-h-screen bg-ui-secondary-200 pb-60">
        <LockSelection />
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
                {eventData?.eventUrl && (
                  <div className="p-2 text-base text-center flex gap-2 items-center border rounded-xl">
                    <MdOutlineTipsAndUpdates size="24" />
                    <p>
                      This lock is used to sell {eventData.eventName}. You can
                      update this event&apos;s{' '}
                      <Link href={eventData.eventUrl} className="underline">
                        settings directly
                      </Link>
                      .
                    </p>
                  </div>
                )}

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
                <Members
                  lockAddress={lockAddress}
                  network={lockNetwork!}
                  filters={filters}
                  loading={loading}
                  setPage={setPage}
                  page={page}
                  NoMemberNoFilter={() => {
                    const checkoutLink = '/locks/checkout-url'
                    return (
                      <ImageBar
                        src="/images/illustrations/no-member.svg"
                        alt="No members"
                        description={
                          <span>
                            Lock is deployed. You can{' '}
                            <button
                              onClick={toggleAirdropKeys}
                              className="outline-none cursor-pointer text-brand-ui-primary"
                            >
                              Airdrop Keys
                            </button>{' '}
                            or{' '}
                            <Link href={checkoutLink}>
                              <span className="outline-none cursor-pointer text-brand-ui-primary">
                                Share a purchase link
                              </span>
                            </Link>{' '}
                            to your community.
                          </span>
                        }
                      />
                    )
                  }}
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
