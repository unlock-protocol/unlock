import React, { useState, useContext, Fragment, MouseEventHandler } from 'react'
import useClipboard from 'react-use-clipboard'
import { isEthPassSupported, Platform } from '../../../services/ethpass'
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
import {
  RiErrorWarningFill as DangerIcon,
  RiArrowGoForwardFill as ExtendMembershipIcon,
} from 'react-icons/ri'
import { Badge, Button, Card, minifyAddress } from '@unlock-protocol/ui'
import { networks } from '@unlock-protocol/networks'
import QRModal from './QRModal'
import useMetadata from '../../../hooks/useMetadata'
import WedlockServiceContext from '../../../contexts/WedlocksContext'
import { useAuth } from '../../../contexts/AuthenticationContext'
import { useConfig } from '../../../utils/withConfig'
import { OpenSeaIcon } from '../../icons'
import { CancelAndRefundModal } from './CancelAndRefundModal'
import { KeyInfoDrawer } from './KeyInfoDrawer'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Menu, Transition } from '@headlessui/react'
import { classed as tw } from '@tw-classed/react'
import { TbTools as ToolsIcon } from 'react-icons/tb'
import { ToastHelper } from '~/components/helpers/toast.helper'
import {
  RiNavigationFill as ExploreIcon,
  RiQrCodeLine as QrCodeIcon,
} from 'react-icons/ri'
import {
  RiFileCopyLine as CopyLineIcon,
  RiExternalLinkFill as ExternalIcon,
} from 'react-icons/ri'
import { ExtendMembershipModal } from './Extend'
import { Key } from '~/hooks/useKeys'
import { TbReceipt as ReceiptIcon } from 'react-icons/tb'
import { useGetReceiptsPageUrl } from '~/hooks/useReceipts'
import { AddToDeviceWallet, ApplePassModal } from './AddToPhoneWallet'
import { isIOS } from 'react-device-detect'
import Image from 'next/image'

export const MenuButton = tw.button(
  'group flex gap-2 w-full font-semibold items-center rounded-md px-2 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      active: {
        true: 'bg-ui-main-500 text-white fill-white',
      },
    },
  }
)

export interface Props {
  ownedKey: Key
  account: string
  network: number
}

function Key({ ownedKey, account, network }: Props) {
  const { lock, expiration, tokenId, isExpired, isExtendable, isRenewable } =
    ownedKey
  const { getWalletService } = useAuth()
  const wedlockService = useContext(WedlockServiceContext)
  const web3Service = useWeb3Service()
  const { watchAsset } = useAuth()
  const config = useConfig()
  const [showingQR, setShowingQR] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [signature, setSignature] = useState<any | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [expireAndRefunded, setExpireAndRefunded] = useState(false)
  const [showExtendMembershipModal, setShowExtendMembership] = useState(false)
  const [showApplePassModal, setShowApplePassModal] = useState(false)
  const [applePassUrl, setPassUrl] = useState<string>()
  const isKeyExpired = isExpired || expireAndRefunded

  const { data: lockData, isLoading: isLockDataLoading } = useQuery(
    ['lock', lock.address, network],
    () => {
      return web3Service.getLock(lock.address, network)
    }
  )
  const metadata = useMetadata(lock.address, tokenId, network)
  const [_, setCopied] = useClipboard(lock.address, {
    successDuration: 2000,
  })

  const handleQRCodeSignature: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.preventDefault()
    event.stopPropagation()
    const payload = JSON.stringify({
      network,
      account,
      lockAddress: lock.address,
      timestamp: Date.now(),
      tokenId,
    })
    const walletService = await getWalletService()

    const signature = await walletService.signMessage(payload, 'personal_sign')
    setSignature({
      payload,
      signature,
    })
    setShowingQR(true)
  }

  const addToWallet = () => {
    watchAsset({
      network,
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
    window.open(url, '_')
  }

  const onOpenSea = () => {
    const { opensea } = networks[network]
    const url = opensea?.tokenUrl(lock.address, tokenId) ?? null
    if (!url) {
      return
    }
    window.open(url, '_')
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
      ToastHelper.error('We could not send the email. Please try again later')
    }
  }

  const { opensea } = networks[network] ?? {}

  const isAvailableOnOpenSea =
    opensea?.tokenUrl(lock.address, tokenId) !== null ?? false

  const baseSymbol = config.networks[network].nativeCurrency.symbol!
  const symbol =
    isLockDataLoading || !lockData
      ? baseSymbol
      : lockTickerSymbol(lockData, baseSymbol)

  const isRefundable = !isLockDataLoading && !isKeyExpired

  const networkName = networks[ownedKey.network]?.name

  const { isLoading: isLoadingUrl, data: receiptsPageUrl } =
    useGetReceiptsPageUrl({
      lockAddress: lock.address,
      network,
      tokenId,
    })

  const onReceiptsPage = () => {
    if (!receiptsPageUrl) {
      return
    }
    window.open(receiptsPageUrl, '_')
  }

  return (
    <Card className="grid gap-6" shadow="lg" padding="xs">
      <KeyInfoDrawer
        isOpen={showMoreInfo}
        setIsOpen={setShowMoreInfo}
        account={account}
        lock={lock}
        tokenId={tokenId}
        network={network}
        expiration={expiration}
        imageURL={metadata.image}
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
      <ExtendMembershipModal
        isOpen={showExtendMembershipModal}
        setIsOpen={setShowExtendMembership}
        lock={lock}
        tokenId={tokenId}
        account={account}
        currency={symbol}
        network={network}
        ownedKey={ownedKey}
      />
      <ApplePassModal
        isOpen={showApplePassModal}
        setIsOpen={setShowApplePassModal}
        applePassUrl={applePassUrl}
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
            onClick={handleQRCodeSignature}
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
              <Menu.Items className="absolute right-0 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg w-80 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-1">
                  <Menu.Item disabled={!isAvailableOnOpenSea}>
                    {({ disabled, active }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={onOpenSea}
                      >
                        <OpenSeaIcon size={16} />
                        View on Opensea
                      </MenuButton>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ disabled, active }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={onExploreLock}
                      >
                        <ExploreIcon size={16} />
                        Block explorer
                      </MenuButton>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active, disabled }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={addToWallet}
                      >
                        <WalletIcon />
                        Add to my crypto wallet
                      </MenuButton>
                    )}
                  </Menu.Item>
                  {tokenId && isEthPassSupported(network) && (
                    <>
                      <Menu.Item>
                        {({ active, disabled }) => (
                          <AddToDeviceWallet
                            platform={Platform.GOOGLE}
                            disabled={disabled}
                            active={active}
                            as={MenuButton}
                            network={network}
                            lockAddress={lock.address}
                            tokenId={tokenId}
                            name={metadata.name}
                            handlePassUrl={(url: string) => {
                              window.location.assign(url)
                            }}
                          >
                            <Image
                              width="16"
                              height="16"
                              alt="Google Wallet"
                              src={`/images/illustrations/google-wallet.svg`}
                            />
                            Add to my Google Wallet
                          </AddToDeviceWallet>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active, disabled }) => (
                          <AddToDeviceWallet
                            platform={Platform.APPLE}
                            disabled={disabled}
                            active={active}
                            as={MenuButton}
                            network={network}
                            lockAddress={lock.address}
                            tokenId={tokenId}
                            name={metadata.name}
                            handlePassUrl={(url: string) => {
                              if (isIOS) {
                                // Download
                                window.location.assign(url)
                              } else if (setPassUrl) {
                                // Show the modal
                                setPassUrl(url)
                                setShowApplePassModal(true)
                              }
                            }}
                          >
                            <Image
                              width="16"
                              height="16"
                              alt="Apple Wallet"
                              src={`/images/illustrations/apple-wallet.svg`}
                            />
                            Add to my Apple Wallet
                          </AddToDeviceWallet>
                        )}
                      </Menu.Item>
                    </>
                  )}
                  <Menu.Item>
                    {({ active, disabled }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={(event) => {
                          event.preventDefault()
                          setShowMoreInfo(true)
                        }}
                      >
                        <InfoIcon />
                        Show details
                      </MenuButton>
                    )}
                  </Menu.Item>
                  {receiptsPageUrl?.length && (
                    <Menu.Item>
                      {({ active, disabled }) => (
                        <MenuButton
                          disabled={disabled || isLoadingUrl}
                          active={active}
                          onClick={onReceiptsPage}
                        >
                          <ReceiptIcon />
                          Show receipts
                        </MenuButton>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item disabled={!isExtendable}>
                    {({ active, disabled }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={(event) => {
                          event.preventDefault()
                          setShowExtendMembership(true)
                        }}
                      >
                        <ExtendMembershipIcon />
                        {isRenewable && !isKeyExpired
                          ? 'Renew membership'
                          : 'Extend membership'}
                      </MenuButton>
                    )}
                  </Menu.Item>
                </div>
                <div className="p-1">
                  <Menu.Item disabled={!isRefundable}>
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
                        Cancel and refund
                      </MenuButton>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
      <div className="grid gap-2">
        <Avatar
          onClick={(event) => {
            event.preventDefault()
            setShowMoreInfo(true)
          }}
          className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
        >
          <AvatarImage
            className="w-full h-full rounded-xl aspect-1 max-h-72 max-w-72"
            alt={lock.name!}
            src={metadata.image}
            width={250}
            height={250}
          />
          <AvatarFallback
            className="flex flex-col items-center justify-center text-3xl font-bold uppercase rounded-xl aspect-1 h-72 w-72"
            delayMs={100}
          >
            {lock?.name?.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center justify-between rounded">
          <div className="inline-flex items-center gap-2">
            {minifyAddress(lock.address)}
            <button
              aria-label="Copy Lock Address"
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
            className="inline-flex items-center gap-2 text-ui-main-500 px-2 py-0.5 rounded-lg bg-ui-main-50 hover:bg-ui-main-100 hover:text-ui-main-600"
          >
            View <ExternalIcon size={18} />
          </a>
        </div>
        <h3 className="text-xl font-bold rounded">{lock.name}</h3>
        {networkName && (
          <div className="flex items-center justify-between gap-2 py-1">
            <span className="text-gray-500">Network</span>
            <span className="font-bold">{networkName}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
export default Key
