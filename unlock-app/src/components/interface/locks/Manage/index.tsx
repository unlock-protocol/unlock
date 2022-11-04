import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectWalletModal } from '../../ConnectWalletModal'
import { LockDetailCard } from './elements/LockDetailCard'
import { Members } from './elements/Members'
import { TotalBar } from './elements/TotalBar'
import { FiKey as KeyIcon } from 'react-icons/fi'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { BiLink as LinkIcon } from 'react-icons/bi'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'
import { useMutation } from '@tanstack/react-query'
import { Container } from '../../Container'
import { RiPagesLine as PageIcon } from 'react-icons/ri'
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

const ActionBar = ({
  lockAddress,
  network,
  setIsOpen,
  isOpen,
}: ActionBarProps) => {
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
      ToastHelper.success('There is some unexpected issue, please try it again')
    },
  })

  return (
    <>
      <AirdropKeysDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        lockAddress={lockAddress}
        network={network!}
      />
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
            <Button
              variant="outlined-primary"
              size="small"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="flex items-center gap-2">
                <KeyIcon className="text-brand-ui-primary" size={16} />
                <span className="text-brand-ui-primary">Airdrop Keys</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

const TopActionBar = ({ lockAddress, network }: TopActionBarProps) => {
  const router = useRouter()

  const DEMO_URL = `/demo?network=${network}&lock=${lockAddress}`

  const checkoutLink = `/locks/checkout-url?lock=${lockAddress}&network=${network}`

  return (
    <>
      <div className="flex items-center justify-between">
        <button aria-label="arrow back">
          <ArrowBackIcon
            size={20}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
        </button>
        <div className="flex gap-3">
          <Button variant="outlined-primary">
            <a href={DEMO_URL} target="_blank" rel="noreferrer">
              <div className="flex items-center gap-2 text-brand-ui-primary">
                <PageIcon size={15} />
                <span className="hidden md:block">View demo</span>
              </div>
            </a>
          </Button>
          <Link href={checkoutLink}>
            <Button className="p-3 md:px-6">
              <div className="flex items-center gap-2">
                <LinkIcon size={15} />
                <span className="hidden md:block">Generate URL</span>
              </div>
            </Button>
          </Link>
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
