import { Button, Drawer, Input } from '@unlock-protocol/ui'
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
import { HiOutlineShare as ShareOptionIcon } from 'react-icons/hi'
import { useForm } from 'react-hook-form'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'
import { useQuery } from 'react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useConfig } from '~/utils/withConfig'
import { Container } from '../../Container'
import { RiPagesLine as PageIcon } from 'react-icons/ri'
import { FilterBar } from './elements/FilterBar'

interface ActionBarProps {
  lockAddress: string
}

interface TopActionBarProps {
  lockAddress: string
  network: number
}

const ActionBar = ({ lockAddress }: ActionBarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { network } = useAuth()

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
        <div className="flex gap-2">
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
      </div>
    </>
  )
}

const TopActionBar = ({ lockAddress, network }: TopActionBarProps) => {
  const router = useRouter()
  const [generatedURL, setGeneratedURL] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [linkGenerated, setLinkGenerated] = useState(false)
  const web3Service = useWeb3Service()
  const config = useConfig()

  const DEMO_URL = `/demo?network=${network}&lock=${lockAddress}`
  const ICON_URL = `${config.services.storage.host}/lock/${lockAddress}/icon`

  const getLock = async () => {
    return web3Service.getLock(lockAddress, network)
  }

  const { data: lock } = useQuery(['getLock', lockAddress, network], async () =>
    getLock()
  )

  const {
    register,
    formState: { isValid, errors },
    resetField,
    setValue,
    handleSubmit,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      url: '',
    },
  })

  const [isCopied, setCopied] = useClipboard(generatedURL, {
    successDuration: 2000,
  })

  const onGenerateURL = async ({ url }: any) => {
    let recurringPayments
    if (
      lock.publicLockVersion >= 10 &&
      lock.currencyContractAddress &&
      lock.selfAllowance !== '0'
    ) {
      recurringPayments = (365 * 24 * 3600) / lock.expirationDuration
    }

    const checkoutURLConfig = {
      locks: {
        [lockAddress]: {
          network,
          recurringPayments,
        },
      },
      pessimistic: true,
      persistentCheckout: true,
      icon: ICON_URL,
    }

    const urlGenerate = new URL('/checkout', window.location.href)
    urlGenerate.searchParams.append('redirectURI', url)
    urlGenerate.searchParams.append(
      'paywallConfig',
      encodeURIComponent(JSON.stringify(checkoutURLConfig))
    )

    setValue('url', urlGenerate?.toString())
    setGeneratedURL(urlGenerate?.toString())
    setLinkGenerated(true)
  }

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success(`URL copied`)
  }, [isCopied])

  return (
    <>
      <Drawer
        title="Generate Purchase URL"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="flex flex-col h-full gap-10">
          <span className="text-base">
            Generate an URL that you can share with your fans and allow them to
            easily purchase this membership
          </span>
          <div>
            <form onSubmit={handleSubmit(onGenerateURL)}>
              <Input
                placeholder="https://example.com"
                type="url"
                {...register('url', {
                  required: true,
                })}
              />

              <span className="text-xs leading-none">
                Enter the URL to which your members are redirected when they
                have a membership
              </span>
              {errors?.url && (
                <span className="block mt-2 text-xs text-red-700">
                  Please enter a valid URL
                </span>
              )}
              <div className="flex flex-col gap-3 mt-4">
                {!linkGenerated ? (
                  <Button disabled={!isValid} type="submit">
                    <div className="flex items-center gap-2">
                      <span className="text-base">Generate</span>
                      <ShareOptionIcon size={20} />
                    </div>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined-primary"
                      disabled={!isValid}
                      onClick={setCopied}
                      className="w-full"
                    >
                      <div className="flex items-center gap-2 text-brand-ui-primary">
                        <span className="text-base">Copy</span>
                        <ShareOptionIcon size={20} />
                      </div>
                    </Button>
                    <Button
                      variant="transparent"
                      className="w-full mt-auto"
                      onClick={() => {
                        resetField('url')
                        setLinkGenerated(false)
                      }}
                    >
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </Drawer>
      <div className="flex items-center justify-between">
        <Button variant="transparent" className="p-0" aria-label="arrow back">
          <ArrowBackIcon
            size={20}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
        </Button>
        <div className="flex gap-3">
          <Button variant="outlined-primary">
            <a href={DEMO_URL} target="_blank" rel="noreferrer">
              <div className="flex items-center gap-2 text-brand-ui-primary">
                <PageIcon size={15} />
                <span className="hidden md:block">View demo</span>
              </div>
            </a>
          </Button>
          <Button className="p-3 md:px-6" onClick={() => setIsOpen(true)}>
            <div className="flex items-center gap-2">
              <LinkIcon size={15} />
              <span className="hidden md:block">Generate URL</span>
            </div>
          </Button>
        </div>
      </div>
    </>
  )
}

export const ManageLockPage = () => {
  const { network: walletNetwork, changeNetwork } = useAuth()
  const { query } = useRouter()
  const [loading, setLoading] = useState(false)
  const { address, network } = query ?? {}

  const lockNetwork = parseInt(network as string)
  const lockAddress = address as string

  // let's force to switch network based on the lockAddress
  const switchToCurrentNetwork = async () => {
    const differentNetwork = walletNetwork != network

    if (differentNetwork) {
      await changeNetwork(parseInt(`${network}`))
    }
  }

  useEffect(() => {
    switchToCurrentNetwork()
  }, [])

  const [filters, setFilters] = useState({
    query: '',
    filterKey: 'owner',
    expiration: 'all',
  })

  if (!walletNetwork) {
    return <ConnectWalletModal isOpen={true} setIsOpen={() => void 0} />
  }

  return (
    <div className="min-h-screen bg-ui-secondary-200 pb-60">
      <Container>
        <div className="pt-9">
          <div className="mb-7">
            <TopActionBar lockAddress={lockAddress} network={lockNetwork} />
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-14">
            <div className="lg:col-span-3">
              <LockDetailCard lockAddress={lockAddress} network={lockNetwork} />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-9">
              <TotalBar lockAddress={lockAddress} network={lockNetwork} />
              <ActionBar lockAddress={lockAddress} />
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                setLoading={setLoading}
              />
              <Members
                lockAddress={lockAddress}
                network={lockNetwork}
                filters={filters}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ManageLockPage
