import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import React, { Fragment, useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { Members } from './elements/Members'
import { TotalBar } from './elements/TotalBar'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Container } from '../../Container'
import { FaSpinner as SpinnerIcon } from 'react-icons/fa'
import { ExpirationStatus, FilterBar } from './elements/FilterBar'
import { buildCSV } from '~/utils/csv'
import FileSaver from 'file-saver'
import { FaFileCsv as CsvIcon } from 'react-icons/fa'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { useLockManager } from '~/hooks/useLockManager'
import { addressMinify } from '~/utils/strings'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import { UpdateMetadataDrawer } from '../metadata/MetadataUpdate'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface ActionBarProps {
  lockAddress: string
  network: number
  setIsOpen: (open: boolean) => void
  isOpen: boolean
}

interface TopActionBarProps {
  lockAddress: string
  network: number
}

export function downloadAsCSV(cols: string[], metadata: any[]) {
  const csv = buildCSV(cols, metadata)

  const blob = new Blob([csv], {
    type: 'data:text/csv;charset=utf-8',
  })
  FileSaver.saveAs(blob, 'members.csv')
}

const ActionBar = ({ lockAddress, network }: ActionBarProps) => {
  const { account } = useAuth()
  const storageService = useStorageService()
  const walletService = useWalletService()

  const getMembers = async () => {
    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network,
    })
    return storageService.getKeys({
      lockAddress,
      network,
      filters: {
        query: '',
        filterKey: 'owner',
        expiration: 'all',
      },
    })
  }

  const onDownloadCsv = async () => {
    const members = await getMembers()
    const cols: string[] = []
    members?.map((member: any) => {
      Object.keys(member).map((key: string) => {
        if (!cols.includes(key)) {
          cols.push(key) // add key once only if not present in list
        }
      })
    })
    downloadAsCSV(cols, members)
  }

  const { isManager } = useLockManager({
    lockAddress,
    network: network!,
  })

  const onDownloadMutation = useMutation(onDownloadCsv, {
    onSuccess: () => {
      ToastHelper.success('CSV downloaded')
    },
    onError: () => {
      ToastHelper.success(
        `Unexpected issue on CSV download, please try it again`
      )
    },
  })

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-brand-ui-primary">Members</span>
        {isManager && (
          <div className="flex gap-2">
            <Button
              variant="outlined-primary"
              size="small"
              disabled={onDownloadMutation.isLoading}
              onClick={() => onDownloadMutation.mutate()}
            >
              <div className="flex items-center gap-2">
                {onDownloadMutation?.isLoading ? (
                  <SpinnerIcon
                    className="text-brand-ui-primary animate-spin"
                    size={16}
                  />
                ) : (
                  <CsvIcon className="text-brand-ui-primary" size={16} />
                )}
                <span className="text-brand-ui-primary">CSV</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

const PopoverItemPlaceholder = () => {
  return (
    <div className="flex w-full gap-2">
      <div className="w-6 h-6 bg-slate-200 animate-pulse"></div>
      <div className="flex flex-col w-full gap-2">
        <div className="w-1/2 h-3 bg-slate-200 animate-pulse"></div>
        <div className="w-full h-3 bg-slate-200 animate-pulse"></div>
        <div className="w-1/3 h-3 bg-slate-200 animate-pulse"></div>
      </div>
    </div>
  )
}

const PopoverItem = ({ label, description, isLoading, ...props }: any) => {
  if (isLoading) return <PopoverItemPlaceholder />
  return (
    <>
      <div className="cursor-pointer" {...props}>
        <div className="flex flex-col text-left">
          <span className="text-base font-bold text-brand-ui-primary">
            {label}
          </span>
          <span className="text-xs text-brand-dark">{description}</span>
        </div>
      </div>
    </>
  )
}

const ToolsMenu = ({ lockAddress, network }: TopActionBarProps) => {
  const web3Service = useWeb3Service()
  const [airdropKeys, setAirdropKeys] = useState(false)
  const [updateMetadata, setUpdateMetadata] = useState(false)
  const DEMO_URL = `/demo?network=${network}&lock=${lockAddress}`
  const settingsPageUrl = `/locks/settings?address=${lockAddress}&network=${network}`
  const checkoutLink = `/locks/checkout-url?lock=${lockAddress}&network=${network}`

  const getLock = async () => {
    return web3Service.getLock(lockAddress, network)
  }

  const { isLoading, data: lock } = useQuery(
    ['getLock', lockAddress, network],
    async () => getLock()
  )

  const isManager = true
  return (
    <>
      <AirdropKeysDrawer
        isOpen={airdropKeys}
        setIsOpen={setAirdropKeys}
        lockAddress={lockAddress}
        network={network!}
      />

      <UpdateMetadataDrawer
        lock={lock}
        isOpen={updateMetadata}
        setIsOpen={setUpdateMetadata}
      />
      <div className="">
        <Popover className="relative">
          <>
            <Popover.Button className="outline-none ring-0">
              <Button>Tools</Button>
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
                        isLoading={isLoading}
                      />
                    </a>
                    <Link href={checkoutLink} className="text-left">
                      <PopoverItem
                        label="Create Checkout URL"
                        description="Customize your member's purchase journey"
                        isLoading={isLoading}
                      />
                    </Link>
                    <PopoverItem
                      label="Airdrop Keys"
                      description="Send memberships to your members"
                      onClick={() => setAirdropKeys(!airdropKeys)}
                      isLoading={isLoading}
                    />
                    {isManager && (
                      <>
                        <PopoverItem
                          label="Edit NFT Properties"
                          description="Edit & update NFT metadata that will display in platforms such as Opensea"
                          onClick={() => setUpdateMetadata(!updateMetadata)}
                          isLoading={isLoading}
                        />
                        <Link href={settingsPageUrl}>
                          <PopoverItem
                            label="Update Lock Settings"
                            description="Update membership smart contract settings including price and duration"
                            isLoading={isLoading}
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

const TopActionBar = ({ lockAddress, network }: TopActionBarProps) => {
  const router = useRouter()

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
  const { network: walletNetwork, changeNetwork } = useAuth()
  const { query } = useRouter()
  const [loading, setLoading] = useState(false)
  const { address, network } = query ?? {}
  const [airdropKeys, setAirdropKeys] = useState(false)

  const lockNetwork = parseInt(network as string)
  const lockAddress = address as string

  // let's force to switch network based on the lockAddress
  const switchToCurrentNetwork = async () => {
    const differentNetwork = walletNetwork != network

    if (differentNetwork) {
      await changeNetwork(parseInt(`${network}`))
    }
  }

  const { isManager, isLoading: isLoadingLockManager } = useLockManager({
    lockAddress,
    network: walletNetwork!,
  })

  const showNotManagerBanner = !isLoadingLockManager && !isManager

  useEffect(() => {
    switchToCurrentNetwork()
  }, [])

  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
  })
  const [page, setPage] = useState(1)

  if (!walletNetwork) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  const toggleAirdropKeys = () => {
    setAirdropKeys(!airdropKeys)
  }

  return (
    <div className="min-h-screen bg-ui-secondary-200 pb-60">
      <Container>
        <div className="pt-9">
          <div className="flex flex-col gap-3 mb-7">
            <TopActionBar lockAddress={lockAddress} network={lockNetwork} />
            {showNotManagerBanner && <NotManagerBanner />}
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14">
            <div className="lg:col-span-3">
              <LockDetailCard lockAddress={lockAddress} network={lockNetwork} />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-9">
              <TotalBar lockAddress={lockAddress} network={lockNetwork} />
              <ActionBar
                lockAddress={lockAddress}
                network={lockNetwork}
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
                network={lockNetwork}
                filters={filters}
                loading={loading}
                setPage={setPage}
                page={page}
                onAirdropKeys={toggleAirdropKeys}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ManageLockPage
