import { addressMinify } from '~/utils/strings'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { HiOutlineExternalLink as ExternalLinkIcon } from 'react-icons/hi'
import { Button } from '@unlock-protocol/ui'
import useClipboard from 'react-use-clipboard'
import { useEffect } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQueries } from 'react-query'
import { UNLIMITED_KEYS_COUNT, UNLIMITED_KEYS_DURATION } from '~/constants'
import { useConfig } from '~/utils/withConfig'
import { LockIcon } from './LockIcon'
import Duration from '~/components/helpers/Duration'
import { CryptoIcon } from '../../elements/KeyPrice'

interface LockDetailCardProps {
  network: number
  lockAddress: string
}

interface DetailProps {
  label: string
  value?: React.ReactNode
  prepend?: React.ReactNode
  loading?: boolean
}

interface LockInfoCardProps {
  name: string
  lockAddress: string
  network: number
  loading?: boolean
}
const LockInfoCardPlaceholder = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-10 animate-pulse bg-slate-200"></div>
      <div className="flex gap-3">
        <div className="w-40 h-4 animate-pulse bg-slate-200"></div>
        <div className="w-5 h-4 animate-pulse bg-slate-200"></div>
      </div>
    </div>
  )
}

const DetailValuePlaceholder = () => {
  return <div className="w-10 h-5 animate-pulse bg-slate-200"></div>
}

const Detail = ({ label, value, prepend, loading }: DetailProps) => {
  return (
    <div className="flex justify-between py-2 border-b border-black last-of-type:border-0">
      <span className="text-base">{label}</span>
      {loading ? (
        <DetailValuePlaceholder />
      ) : (
        <div className="flex items-center gap-2">
          {prepend && <>{prepend}</>}
          <span className="text-base font-bold text-black">{value || '-'}</span>
        </div>
      )}
    </div>
  )
}

const LockInfoCard = ({
  name,
  lockAddress,
  network,
  loading,
}: LockInfoCardProps) => {
  const { networks } = useConfig()
  const [isCopied, setCopied] = useClipboard(lockAddress, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success(`Address copied`)
  }, [isCopied])

  const { explorer } = networks?.[network] ?? {}

  const explorerUrl = explorer?.urls?.address(lockAddress) || '#'

  if (loading) return <LockInfoCardPlaceholder />

  return (
    <>
      <span className="text-4xl font-bold text-black">{name}</span>
      <div className="flex items-center gap-3">
        <span className="text-base">{addressMinify(lockAddress)}</span>
        <Button variant="transparent" className="p-0 m-0" onClick={setCopied}>
          <CopyIcon size={20} />
        </Button>
        <a href={explorerUrl} target="_blank" rel="noreferrer">
          <Button variant="transparent" className="p-0 m-0">
            <ExternalLinkIcon size={20} className="text-brand-ui-primary" />
          </Button>
        </a>
      </div>
    </>
  )
}

export const LockDetailCard = ({
  lockAddress,
  network,
}: LockDetailCardProps) => {
  const { networks } = useConfig()
  const web3Service = useWeb3Service()

  const getLock = async () => {
    return web3Service.getLock(lockAddress, network)
  }

  const getTokenSymbol = async () => {
    return web3Service.getTokenSymbol(lockAddress, network)
  }

  const [
    { isLoading, data: lock },
    { isLoading: isLoadingSymbol, data: symbol },
  ] = useQueries([
    {
      queryKey: ['getLock', lockAddress, network],
      queryFn: getLock,
    },
    {
      queryKey: ['getTokenSymbol', lockAddress, network],
      queryFn: getTokenSymbol,
    },
  ])

  const { keyPrice, maxNumberOfKeys, expirationDuration } = lock ?? {}

  const { name: networkName } = networks?.[network] ?? {}
  const numbersOfKeys =
    maxNumberOfKeys === UNLIMITED_KEYS_COUNT ? 'Unlimited' : maxNumberOfKeys
  const duration =
    expirationDuration === UNLIMITED_KEYS_DURATION ? (
      'Unlimited'
    ) : (
      <Duration seconds={expirationDuration} />
    )

  const loading = isLoading || isLoadingSymbol

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2">
        <LockIcon
          lockAddress={lockAddress}
          network={network}
          loading={loading}
        />
        <LockInfoCard
          lockAddress={lockAddress}
          network={network}
          name={lock?.name}
          loading={loading}
        />
        <div className="flex flex-col mt-14">
          <Detail label="Network" value={networkName} loading={loading} />
          <Detail label="Key Duration" value={duration} loading={loading} />
          <Detail
            label="Key Quantity"
            value={numbersOfKeys}
            loading={loading}
          />
          <Detail
            label="Price"
            value={keyPrice}
            prepend={<CryptoIcon symbol={symbol} size={22} />}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
