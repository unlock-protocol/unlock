import { addressMinify } from '~/utils/strings'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { HiOutlineExternalLink as ExternalLinkIcon } from 'react-icons/hi'
import { Button } from '@unlock-protocol/ui'
import useClipboard from 'react-use-clipboard'
import { useEffect, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from 'react-query'
import { UNLIMITED_KEYS_COUNT, UNLIMITED_KEYS_DURATION } from '~/constants'
import { useConfig } from '~/utils/withConfig'
import { LockIcon } from './LockIcon'
import Duration from '~/components/helpers/Duration'
import { CryptoIcon } from '../../elements/KeyPrice'
import { AiOutlineEdit as EditIcon } from 'react-icons/ai'
import { CardPayment } from './CardPayment'
import { UpdateDurationModal } from '../modals/UpdateDurationModal'
import { UpdatePriceModal } from '../modals/UpdatePriceModal'
import { UpdateQuantityModal } from '../modals/UpdateQuantityModal'

interface LockDetailCardProps {
  network: number
  lockAddress: string
}

interface DetailProps {
  label: string
  value?: React.ReactNode
  prepend?: React.ReactNode
  append?: React.ReactNode
  loading?: boolean
}

interface LockInfoCardProps {
  name: string
  lockAddress: string
  network: number
  loading?: boolean
}

interface EditButtonProps {
  onClick: () => void
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

const Detail = ({ label, value, prepend, loading, append }: DetailProps) => {
  return (
    <div className="flex justify-between py-2 border-b border-black last-of-type:border-0">
      <span className="text-base">{label}</span>
      {loading ? (
        <DetailValuePlaceholder />
      ) : (
        <div className="flex items-center gap-2 text-right">
          {prepend && <>{prepend}</>}
          <span className="text-base font-bold text-black">{value || '-'}</span>
          {append && <>{append}</>}
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
        <Button
          variant="transparent"
          className="p-0 m-0"
          onClick={setCopied}
          aria-label="copy"
        >
          <CopyIcon size={20} />
        </Button>
        <a href={explorerUrl} target="_blank" rel="noreferrer">
          <Button
            variant="transparent"
            className="p-0 m-0"
            aria-label="external link"
          >
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
  const [update, setUpdate] = useState(0)
  const [editQuantity, setEditQuantity] = useState(false)
  const [editDuration, setEditDuration] = useState(false)
  const [editPrice, setEditPrice] = useState(false)
  const { networks } = useConfig()
  const web3Service = useWeb3Service()

  const getLock = async () => {
    return web3Service.getLock(lockAddress, network)
  }

  const { isLoading, data: lock } = useQuery(
    ['getLock', lockAddress, network, update],
    async () => getLock()
  )

  const { keyPrice, maxNumberOfKeys, expirationDuration } = lock ?? {}

  const { name: networkName, baseCurrencySymbol } = networks?.[network] ?? {}
  const numbersOfKeys =
    maxNumberOfKeys === UNLIMITED_KEYS_COUNT ? 'Unlimited' : maxNumberOfKeys
  const duration =
    expirationDuration === UNLIMITED_KEYS_DURATION ? (
      'Unlimited'
    ) : (
      <Duration seconds={expirationDuration} />
    )

  const loading = isLoading

  const EditButton = ({ onClick }: EditButtonProps) => {
    return (
      <button className="p-1" onClick={onClick} aria-label="edit">
        <EditIcon size={16} />
      </button>
    )
  }

  const onUpdate = () => {
    setUpdate(update + 1)
  }

  const symbol = lock?.currencySymbol || baseCurrencySymbol

  return (
    <>
      <UpdateDurationModal
        lockAddress={lockAddress}
        isOpen={editDuration}
        setIsOpen={setEditDuration}
        onUpdate={onUpdate}
      />

      <UpdatePriceModal
        lockAddress={lockAddress}
        network={network}
        onUpdate={onUpdate}
        isOpen={editPrice}
        setIsOpen={setEditPrice}
      />

      <UpdateQuantityModal
        lockAddress={lockAddress}
        onUpdate={onUpdate}
        isOpen={editQuantity}
        setIsOpen={setEditQuantity}
      />

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
            <Detail
              label="Key Duration"
              value={duration}
              loading={loading}
              append={<EditButton onClick={() => setEditDuration(true)} />}
            />
            <Detail
              label="Key Quantity"
              value={numbersOfKeys}
              loading={loading}
              append={<EditButton onClick={() => setEditQuantity(true)} />}
            />
            <Detail
              label="Price"
              value={keyPrice}
              prepend={<CryptoIcon symbol={symbol} size={22} />}
              loading={loading}
              append={<EditButton onClick={() => setEditPrice(true)} />}
            />
          </div>
          <div className="mt-6">
            <CardPayment lockAddress={lockAddress} network={network} />
          </div>
        </div>
      </div>
    </>
  )
}
