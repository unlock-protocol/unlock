import { Button, Icon } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import React, { Fragment, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { Members } from './elements/Members'
import { TotalBar } from './elements/TotalBar'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'
import { useMutation } from '@tanstack/react-query'
import { ExpirationStatus, FilterBar } from './elements/FilterBar'
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
import { BiQrScan as ScanIcon } from 'react-icons/bi'
import { Picker } from '../../Picker'
import { storage } from '~/config/storage'
import { useMetadata } from '~/hooks/metadata'
import { getLockTypeByMetadata } from '@unlock-protocol/core'
import { MEMBERS_PER_PAGE } from '~/constants'

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

const ActionBar = ({ lockAddress, network, page }: ActionBarProps) => {
  const { isLoading: isLoadingMetadata, data: metadata } = useMetadata({
    lockAddress,
    network,
  })

  const { isEvent } = getLockTypeByMetadata(metadata)

  // this breaks when there is too many rows!
  const onDownloadCsv = async () => {
    const response = await storage.keys(
      network,
      lockAddress,
      '',
      'owner',
      'all',
      page - 1,
      MEMBERS_PER_PAGE
    )
    const members = response.data
    const cols: string[] = []
    members?.map((member: any) => {
      Object.keys(member).map((key: string) => {
        if (!cols.includes(key)) {
          cols.push(key) // add key once only if not present in list
        }
      })
    })
    downloadAsCSV({
      cols,
      metadata: members,
    })
  }

  const { isManager } = useLockManager({
    lockAddress,
    network: network!,
  })

  const onDownloadMutation = useMutation(onDownloadCsv, {
    meta: {
      errorMessage: 'Failed to download members list',
    },
  })

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-brand-ui-primary">
          {isEvent ? 'Attendees' : 'Members'}
        </span>
        {isManager && (
          <div className="flex gap-2">
            <Button
              variant="outlined-primary"
              size="small"
              disabled={isLoadingMetadata}
              loading={onDownloadMutation.isLoading}
              iconLeft={<CsvIcon className="text-brand-ui-primary" size={16} />}
              onClick={() => onDownloadMutation.mutate()}
            >
              Download {isEvent ? 'attendee' : 'member'} list
            </Button>
          </div>
        )}
      </div>
    </>
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
  const checkoutLink = `/locks/checkout-url?lock=${lockAddress}&network=${network}`
  const verificationLink = `/verification`

  const { isManager } = useLockManager({
    lockAddress,
    network: network!,
  })

  return (
    <>
      <AirdropKeysDrawer
        isOpen={airdropKeys}
        setIsOpen={setAirdropKeys}
        lockAddress={lockAddress}
        network={network!}
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
              <Popover.Panel className="absolute right-0 z-10 max-w-sm px-4 mt-3 transform w-80">
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
                        label="Create Checkout URL"
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
                    <Link href={verificationLink} className="text-left">
                      <PopoverItem
                        label="Verification"
                        description="Scan and verify the authentication of tickets for your events"
                        icon={ScanIcon}
                      />
                    </Link>
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

const TopActionBar = ({ lockAddress, network }: TopActionBarProps) => {
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
  const { account } = useAuth()

  return (
    <div className="p-2 text-base text-center text-red-700 bg-red-100 border border-red-700 rounded-xl">
      You are connected as {addressMinify(account!)} and this address is not a
      manager for this lock. If you want to update details, please connect as
      lock manager.
    </div>
  )
}

export const ManageLockPage = () => {
  const { account: owner } = useAuth()
  const { query } = useRouter()
  const [loading, setLoading] = useState(false)
  const [network, setNetwork] = useState<string>(
    (query?.network as string) ?? ''
  )
  const [lockAddress, setLockAddress] = useState<string>(
    (query?.address as string) ?? ''
  )
  const [airdropKeys, setAirdropKeys] = useState(false)

  const lockNetwork = network ? parseInt(network as string) : undefined

  const withoutParams =
    !query?.lockAddress && !query.network && !(lockAddress && network)

  const { isManager, isLoading: isLoadingLockManager } = useLockManager({
    lockAddress,
    network: lockNetwork!,
  })

  const showNotManagerBanner = !isLoadingLockManager && !isManager

  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
  })
  const [page, setPage] = useState(1)

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
      (query?.address as string)?.length > 0 &&
      (query?.network as string)?.length > 0

    return (
      <div>
        {withoutParams ? (
          <>
            <h2 className="mb-2 text-lg font-bold text-brand-ui-primary">
              Select a lock to start manage it s
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
        lockAddress={lockAddress}
        network={parseInt(network!, 10)}
      />
      <div className="min-h-screen bg-ui-secondary-200 pb-60">
        <LockSelection />
        {!withoutParams && (
          <div className="pt-9">
            <div className="flex flex-col gap-3 mb-7">
              <TopActionBar lockAddress={lockAddress} network={lockNetwork!} />
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
                  onAirdropKeys={toggleAirdropKeys}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ManageLockPage
