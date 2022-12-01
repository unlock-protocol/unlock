import React, { useState, useContext, Fragment } from 'react'
import useClipboard from 'react-use-clipboard'
import {
  AvatarImage,
  Root as Avatar,
  Fallback as AvatarFallback,
} from '@radix-ui/react-avatar'
import { BsTrashFill as CancelIcon } from 'react-icons/bs'
import {
  FaWallet as WalletIcon,
  FaCheckCircle as CheckIcon,
  FaInfoCircle as InfoIcon,
} from 'react-icons/fa'
import { RiErrorWarningFill as DangerIcon } from 'react-icons/ri'
import { Badge, Button, minifyAddress } from '@unlock-protocol/ui'
import { networks } from '@unlock-protocol/networks'
import { expirationAsDate } from '../../../utils/durations'
import QRModal from './QRModal'
import useMetadata from '../../../hooks/useMetadata'
import { useWalletService } from '../../../utils/withWalletService'
import WedlockServiceContext from '../../../contexts/WedlocksContext'
import { useAuth } from '../../../contexts/AuthenticationContext'
import { MAX_UINT } from '../../../constants'
import { useConfig } from '../../../utils/withConfig'
import { OpenSeaIcon } from '../../icons'
import { CancelAndRefundModal } from './CancelAndRefundModal'
import { KeyMetadataDrawer } from './KeyMetadataDrawer'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Menu, Transition } from '@headlessui/react'
import { classed as tw } from '@tw-classed/react'
import { TbTools as ToolsIcon } from 'react-icons/tb'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { FaPlus as ExtendIcon } from 'react-icons/fa'
import {
  RiNavigationFill as ExploreIcon,
  RiQrCodeLine as QrCodeIcon,
} from 'react-icons/ri'
import {
  RiFileCopyLine as CopyLineIcon,
  RiExternalLinkFill as ExternalIcon,
} from 'react-icons/ri'
import { useStorageService } from '~/utils/withStorageService'
import dayjs from 'dayjs'

export const MenuButton = tw.button(
  'group flex gap-2 w-full font-medium items-center rounded-md px-2 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      active: {
        true: 'bg-ui-main-500 text-white fill-white',
      },
    },
  }
)

interface KeyBoxProps {
  lock: any
  expiration: string
  tokenId: string
  network: number
  expirationStatus: string
}

const KeyBoxItem = ({ label, value }: Record<'label' | 'value', string>) => {
  return (
    <div className="flex items-center justify-between gap-2 py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

const KeyBox = ({
  lock,
  expiration,
  tokenId,
  network,
  expirationStatus,
}: KeyBoxProps) => {
  const metadata = useMetadata(lock.address, tokenId, network)
  const config = useConfig()
  const [_, setCopied] = useClipboard(lock.address, {
    successDuration: 2000,
  })
  const storage = useStorageService()
  const { data: subscriptionInfo, isLoading } = useQuery(
    ['subscriptions', lock.address, tokenId, network],
    async () => {
      const response = await storage.locksmith.getSubscription(
        network,
        lock.address,
        tokenId
      )
      return response.data.subscriptions?.[0] ?? {}
    },
    {
      retry: 2,
      onError(error) {
        console.error(error)
      },
    }
  )
  console.log(subscriptionInfo, isLoading)

  return (
    <div className="grid gap-2">
      <div>
        <Avatar className="flex items-center justify-center ">
          <AvatarImage
            className="w-full h-full rounded-xl aspect-1 max-h-72 max-w-72 "
            alt={lock.name}
            src={metadata.image}
            width={250}
            height={250}
          />
          <AvatarFallback className="uppercase" delayMs={100}>
            {lock.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          {minifyAddress(lock.address)}
          <button
            onClick={(event) => {
              event.preventDefault()
              setCopied()
              ToastHelper.success('Copied!')
            }}
          >
            <CopyLineIcon size={18} />
          </button>
        </div>
        <a
          href={config.networks?.[network]?.explorer?.urls.address(
            lock.address
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-ui-main-500"
        >
          View <ExternalIcon size={18} />
        </a>
      </div>
      <div className="divide-y divide-y-reverse divide-brand-dark">
        <h3 className="text-lg font-bold line-clamp-1">{lock.name}</h3>
        <KeyBoxItem label="Token ID" value={tokenId} />
        {expiration !== MAX_UINT && (
          <KeyBoxItem label="Valid" value={expirationStatus} />
        )}
        {subscriptionInfo?.next && (
          <KeyBoxItem
            label="Renew On"
            value={dayjs
              .unix(subscriptionInfo.next)
              .format('D MMM YYYY, h:mm A')}
          />
        )}
        {subscriptionInfo?.approvedTime && (
          <KeyBoxItem
            label="Renew Cycle"
            value={subscriptionInfo.approvedTime}
          />
        )}
        {subscriptionInfo?.balance && (
          <KeyBoxItem label="User Balance" value={subscriptionInfo.balance} />
        )}
        {subscriptionInfo?.type && (
          <KeyBoxItem label="Payment Type" value={subscriptionInfo.type} />
        )}
      </div>
    </div>
  )
}

export interface KeyProps {
  id: string
  tokenId: string
  owner: string
  manager?: any
  expiration: string
  tokenURI?: string
  createdAtBlock: any
  cancelled?: boolean
  lock: {
    id: string
    address: any
    name?: string
    expirationDuration?: any
    tokenAddress: any
    price: any
    lockManagers: any[]
    version: any
    createdAtBlock?: any
  }
}
export interface Props {
  ownedKey: KeyProps
  account: string
  network: number
}

function Key({ ownedKey, account, network }: Props) {
  const { lock, expiration, tokenId } = ownedKey
  const { network: accountNetwork } = useAuth()
  const walletService = useWalletService()
  const wedlockService = useContext(WedlockServiceContext)
  const web3Service = useWeb3Service()
  const { watchAsset } = useAuth()
  const config = useConfig()
  const expirationStatus = expirationAsDate(expiration)

  const [error, setError] = useState<string | null>()
  const [showingQR, setShowingQR] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [signature, setSignature] = useState<any | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [expireAndRefunded, setExpireAndRefunded] = useState(false)
  const isKeyExpired =
    expirationStatus.toLocaleLowerCase() === 'expired' || expireAndRefunded
  const { data: lockData, isLoading: isLockDataLoading } = useQuery(
    ['lock', lock.address, network],
    () => {
      return web3Service.getLock(lock.address, network)
    }
  )

  const handleSignature = async () => {
    setError('')
    const payload = JSON.stringify({
      network,
      account,
      lockAddress: lock.address,
      timestamp: Date.now(),
      tokenId,
    })

    const signature = await walletService.signMessage(payload, 'personal_sign')

    setSignature({
      payload,
      signature,
    })
    setShowingQR(true)
  }

  const addToWallet = () => {
    watchAsset({
      address: lock.address,
      symbol: 'KEY',
      image: `${config.services.storage.host}/lock/${lock.address}/icon`,
    })
  }

  const onExploreLock = () => {
    const url = networks[network].explorer?.urls.address(lock.address)
    if (!url) {
      return
    }
    window.open(url)
  }

  const onOpenSea = () => {
    const { opensea } = networks[network]
    const url = opensea?.tokenUrl(lock.address, tokenId) ?? null
    if (!url) {
      return
    }
    window.open(url)
  }

  const sendEmail = async (recipient: string, qrImage: string) => {
    if (!wedlockService) {
      return
    }
    try {
      await wedlockService.keychainQREmail(
        recipient,
        `${window.location.origin}/keychain`,
        lock!.name ?? '',
        qrImage
      )
    } catch {
      setError('We could not send the email. Please try again later')
    }
  }

  const onExtend = async () => {
    try {
      const promise = walletService.extendKey({
        lockAddress: lock.address,
        tokenId,
        referrer: account,
      })
      ToastHelper.promise(promise, {
        success: 'successfully extended the membership.',
        error: 'Unable to extend the membership',
        loading: 'Extending membership.',
      })
    } catch (error) {
      console.error(error)
    }
  }

  const isAvailableOnOpenSea =
    networks[network].opensea?.tokenUrl(lock.address, tokenId) !== null ?? false

  const baseSymbol = walletService.networks[network].baseCurrencySymbol!
  const symbol =
    isLockDataLoading || !lockData
      ? baseSymbol
      : lockTickerSymbol(lockData, baseSymbol)

  const isRefundable = !isLockDataLoading && !isKeyExpired

  const wrongNetwork = network !== accountNetwork

  return (
    <div className="grid gap-6 p-4 bg-white border border-gray-200 shadow-lg rounded-xl">
      <KeyMetadataDrawer
        isOpen={showMetadata}
        setIsOpen={setShowMetadata}
        account={account}
        lock={lock}
        tokenId={tokenId}
        network={network}
      />
      <CancelAndRefundModal
        isOpen={showCancelModal}
        setIsOpen={setShowCancelModal}
        lock={lock}
        tokenId={tokenId}
        account={account}
        currency={symbol}
        network={network}
        onExpireAndRefund={() => setExpireAndRefunded(true)}
      />
      <QRModal
        lock={lock}
        isOpen={!!(showingQR && signature)}
        setIsOpen={setShowingQR}
        dismiss={() => setSignature(null)}
        sendEmail={sendEmail}
        signature={signature}
      />
      <div className="flex items-center justify-between">
        <div>
          {isKeyExpired ? (
            <Badge
              size="small"
              variant="red"
              iconRight={<DangerIcon size={12} key="expired" />}
            >
              Expired
            </Badge>
          ) : (
            <Badge
              size="small"
              variant="green"
              iconRight={<CheckIcon size={12} key="valid" />}
            >
              Valid
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="QR Code"
            className="inline-flex items-center gap-2 p-2 border rounded-full border-brand-dark hover:bg-gray-50"
            type="button"
            onClick={handleSignature}
          >
            <QrCodeIcon size={18} />
          </button>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button as={Fragment}>
              <Button
                size="small"
                variant="outlined-primary"
                iconLeft={<ToolsIcon key="options" />}
              >
                Options
              </Button>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg w-72 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-1">
                  <Menu.Item>
                    {({ disabled, active }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={onExploreLock}
                      >
                        <ExploreIcon size={16} />
                        Explore lock
                      </MenuButton>
                    )}
                  </Menu.Item>
                  <Menu.Item disabled={!isAvailableOnOpenSea}>
                    {({ disabled, active }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={onOpenSea}
                      >
                        <OpenSeaIcon size={16} />
                        Open on Opensea
                      </MenuButton>
                    )}
                  </Menu.Item>
                </div>
                <div className="p-1">
                  <Menu.Item>
                    {({ active, disabled }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={addToWallet}
                      >
                        <WalletIcon />
                        Add to wallet
                      </MenuButton>
                    )}
                  </Menu.Item>
                  <Menu.Item disabled={!isRefundable || wrongNetwork}>
                    {({ active, disabled }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={(event) => {
                          event.preventDefault()
                          setShowCancelModal(!showCancelModal)
                        }}
                      >
                        <CancelIcon />
                        {wrongNetwork
                          ? `Switch to ${networks[network].name} to cancel`
                          : 'Cancel and refund'}
                      </MenuButton>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active, disabled }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={(event) => {
                          event.preventDefault()
                          onExtend()
                        }}
                      >
                        <ExtendIcon />
                        Extend membership
                      </MenuButton>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active, disabled }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={(event) => {
                          event.preventDefault()
                          setShowMetadata(true)
                        }}
                      >
                        <InfoIcon />
                        View metadata
                      </MenuButton>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
      <KeyBox
        network={network}
        lock={lock}
        expiration={expiration}
        tokenId={tokenId}
        expirationStatus={expirationStatus}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}
export default Key
