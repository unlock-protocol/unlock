import {
  useState,
  useContext,
  Fragment,
  MouseEventHandler,
  useRef,
  useEffect,
} from 'react'
import useClipboard from 'react-use-clipboard'
import { BsTrashFill as CancelIcon } from 'react-icons/bs'
import {
  FaWallet as WalletIcon,
  FaInfoCircle as InfoIcon,
} from 'react-icons/fa'
import { RiArrowGoForwardFill as ExtendMembershipIcon } from 'react-icons/ri'
import { BiTransfer as TransferIcon } from 'react-icons/bi'
import { Badge, Card, minifyAddress } from '@unlock-protocol/ui'
import { networks } from '@unlock-protocol/networks'
import QRModal from './QRModal'
import WedlockServiceContext from '../../../contexts/WedlocksContext'
import { OpenSeaIcon } from '../../icons'
import { CancelAndRefundModal } from './CancelAndRefundModal'
import { KeyInfoDrawer } from './KeyInfoDrawer'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Menu, Transition } from '@headlessui/react'
import { classed as tw } from '@tw-classed/react'
import { TbTools as ToolsIcon } from 'react-icons/tb'
import { ToastHelper } from '@unlock-protocol/ui'
import {
  RiNavigationFill as ExploreIcon,
  RiQrCodeLine as QrCodeIcon,
} from 'react-icons/ri'
import { RiFileCopyLine as CopyLineIcon } from 'react-icons/ri'
import { ExtendMembershipModal } from './Extend'
import { Key as FullyLoadedKey } from '~/hooks/useKeys'
import { TbReceipt as ReceiptIcon } from 'react-icons/tb'
import { AddToPhoneWallet } from './AddToPhoneWallet'
import { useRouter } from 'next/navigation'
import { Platform } from '~/services/passService'
import { TransferModal } from './TransferModal'
import { isKeyTransferable } from '~/utils/key'
import { useProvider } from '~/hooks/useProvider'
import { config } from '~/config/app'
import { AiOutlineLoading3Quarters as LoadingIcon } from 'react-icons/ai'
import Image from 'next/image'

// Loading shimmer animation
const Shimmer = tw.div('animate-pulse bg-gray-200 rounded', {
  variants: {
    size: {
      sm: 'h-4 w-16',
      md: 'h-4 w-24',
      lg: 'h-5 w-32',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

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
  ownedKey: FullyLoadedKey
  owner: string
  network: number
}

function Key({ ownedKey, owner, network }: Props) {
  console.log('ownedKey', ownedKey)
  const { getWalletService, watchAsset } = useProvider()
  const wedlockService = useContext(WedlockServiceContext)
  const [showingQR, setShowingQR] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [signature, setSignature] = useState<any | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [expireAndRefunded, setExpireAndRefunded] = useState(false)
  const [showExtendMembershipModal, setShowExtendMembership] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const videoRef = useRef(null)
  const [canPlayImageAsVideo, setCanPlayImageAsVideo] = useState(false)
  const isKeyExpired = ownedKey.isExpired || expireAndRefunded

  const lockData = ownedKey.lockData
  const isLockDataLoading = ownedKey._isLockDataLoading
  const metadata = ownedKey.metadata
  const isMetadataLoading = ownedKey._isMetadataLoading
  const transferFeeValue = ownedKey.transferFee
  const transferFeeLoading = ownedKey._isTransferFeeLoading
  const transferfeeError = null
  const receiptsPageUrl = ownedKey.receiptsPageUrl
  const isLoadingReceiptsUrl = ownedKey._isReceiptsUrlLoading
  const isFullyLoaded = ownedKey._isFullyLoaded

  const [_, setCopied] = useClipboard(ownedKey.lock.address, {
    successDuration: 2000,
  })

  let isTransferable
  if (typeof transferFeeValue === 'number' && !transferFeeLoading) {
    isTransferable = isKeyTransferable(transferFeeValue)
  }

  const handleQRCodeSignature: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.preventDefault()
    event.stopPropagation()
    const payload = JSON.stringify({
      network,
      owner,
      lockAddress: ownedKey.lock.address,
      timestamp: Date.now(),
      tokenId: ownedKey.tokenId,
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
      address: ownedKey.lock.address,
      tokenId: ownedKey.tokenId,
    })
  }

  const onExploreLock = () => {
    const url = networks[network].explorer?.urls.address(ownedKey.lock.address)
    if (!url) {
      return
    }
    window.open(url, '_')
  }

  const onOpenSea = () => {
    const { opensea } = networks[network]
    const url =
      opensea?.tokenUrl(ownedKey.lock.address, ownedKey.tokenId) ?? null
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
        ownedKey.lock.name ?? '',
        qrImage
      )
    } catch {
      ToastHelper.error('We could not send the email. Please try again later')
    }
  }

  const router = useRouter()

  const { opensea } = networks[network] ?? {}

  const isAvailableOnOpenSea = !!opensea?.tokenUrl(
    ownedKey.lock.address,
    ownedKey.tokenId
  )

  const baseSymbol = config.networks[network].nativeCurrency.symbol!
  const symbol =
    isLockDataLoading || !lockData
      ? baseSymbol
      : lockTickerSymbol(lockData, baseSymbol)

  const isRefundable = !isLockDataLoading && !isKeyExpired

  const networkName = networks[ownedKey.network]?.name

  const onReceiptsPage = () => {
    if (receiptsPageUrl) {
      window.open(receiptsPageUrl, '_blank')
    }
  }

  const checkIfImageUrlIsVideo = async () => {
    if (!metadata?.image) {
      return
    }

    // Check if image URL ends with video extension
    const videoExtensions = ['.mp4', '.webm', '.ogg']
    const isVideo = videoExtensions.some((ext) =>
      metadata.image.toLowerCase().endsWith(ext)
    )

    setCanPlayImageAsVideo(isVideo)
  }

  useEffect(() => {
    if (!isMetadataLoading && metadata?.image) {
      checkIfImageUrlIsVideo()
    }
  }, [isMetadataLoading, metadata])

  // Helper for progressive UI enhancement
  const renderWithLoading = (
    isLoading: boolean,
    content: React.ReactNode,
    placeholder: React.ReactNode
  ) => {
    return isLoading ? placeholder : content
  }

  return (
    <Card className="p-0 overflow-hidden w-full">
      <div className="m-5 space-y-2 flex flex-col h-full">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 text-brand-gray">
            {renderWithLoading(
              isLockDataLoading,
              <Badge>{networkName}</Badge>,
              <Shimmer size="sm" />
            )}
            <div className="inline-flex items-center gap-2">
              {minifyAddress(ownedKey.lock.address)}
              <button
                aria-label="Copy Lock Address"
                className="text-brand-ui-primary"
                onClick={() => {
                  setCopied()
                  ToastHelper.success('Copied')
                }}
              >
                <CopyLineIcon
                  className="hover:fill-brand-ui-primary"
                  size={12}
                />
              </button>
            </div>{' '}
          </div>
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="inline-flex w-full cursor-pointer justify-center rounded-md px-2 py-1 text-sm font-medium text-brand-ui-primary hover:bg-ui-main-50 focus:outline-none">
                <ToolsIcon className="text-ui-main-600 w-4 h-4" />
              </Menu.Button>
            </div>

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
                  {owner && (
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
                  {owner && receiptsPageUrl?.length && (
                    <Menu.Item>
                      {({ active, disabled }) => (
                        <MenuButton
                          disabled={disabled || isLoadingReceiptsUrl}
                          active={active}
                          onClick={onReceiptsPage}
                        >
                          <ReceiptIcon />
                          Show receipts
                        </MenuButton>
                      )}
                    </Menu.Item>
                  )}
                  {/* This should go in the details modal! */}
                  {owner && (
                    <Menu.Item disabled={!ownedKey.isExtendable}>
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
                          {ownedKey.isRenewable && !isKeyExpired
                            ? 'Renew membership'
                            : 'Extend membership'}
                        </MenuButton>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item
                    disabled={
                      isKeyExpired ||
                      (typeof isTransferable === 'boolean' && !isTransferable)
                    }
                  >
                    {({ active, disabled }) => (
                      <MenuButton
                        disabled={disabled}
                        active={active}
                        onClick={(event) => {
                          event.preventDefault()
                          setShowTransferModal(true)
                        }}
                      >
                        <TransferIcon />
                        Transfer membership
                      </MenuButton>
                    )}
                  </Menu.Item>
                </div>
                {owner && (
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
                )}

                {/* Add to wallet buttons */}
                {owner && ownedKey.tokenId && (
                  <div className="p-1">
                    <Menu.Item>
                      {() => (
                        <div className="flex flex-row gap-1">
                          <AddToPhoneWallet
                            platform={Platform.GOOGLE}
                            as={MenuButton}
                            network={network}
                            lockAddress={ownedKey.lock.address}
                            tokenId={ownedKey.tokenId}
                            handlePassUrl={(url: string) => {
                              window.location.assign(url)
                            }}
                          />
                          <AddToPhoneWallet
                            platform={Platform.APPLE}
                            as={MenuButton}
                            network={network}
                            lockAddress={ownedKey.lock.address}
                            tokenId={ownedKey.tokenId}
                          />
                        </div>
                      )}
                    </Menu.Item>
                  </div>
                )}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        {renderWithLoading(
          isMetadataLoading,
          <div className="w-full rounded-xl aspect-1 max-h-72 max-w-72 overflow-hidden">
            {canPlayImageAsVideo ? (
              <video
                className="w-full h-full object-cover"
                src={metadata.image}
                ref={videoRef}
                autoPlay
                muted
                playsInline
                loop
              />
            ) : (
              <Image
                className="w-full h-full object-cover"
                alt={ownedKey.lock.name || 'Key NFT'}
                src={metadata.image}
                width={250}
                height={250}
                onLoad={() => checkIfImageUrlIsVideo()}
              />
            )}
          </div>,
          <div className="w-full h-full aspect-1 max-h-72 max-w-72 bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
            <span className="text-gray-400 flex items-center gap-2">
              <LoadingIcon className="animate-spin" />
              Loading...
            </span>
          </div>
        )}
        <div className="flex flex-col gap-2 mt-auto">
          {renderWithLoading(
            isLockDataLoading || isMetadataLoading,
            <h3 className="text-xl font-bold rounded">
              {metadata.name || ownedKey.lock.name}
            </h3>,
            <Shimmer size="lg" />
          )}

          {/* Only show the action buttons when full data is loaded */}
          {!isFullyLoaded && (
            <div className="flex justify-center py-2">
              <LoadingIcon className="animate-spin h-5 w-5 text-brand-ui-primary" />
              <span className="ml-2 text-sm text-gray-500">
                Loading additional data...
              </span>
            </div>
          )}

          {isFullyLoaded && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                disabled={isLoadingReceiptsUrl}
                onClick={handleQRCodeSignature}
                aria-label="Show QR Code"
                className="bg-ui-main-100 hover:bg-ui-main-200 text-ui-main-500 rounded-md p-2"
              >
                <QrCodeIcon size={20} />
              </button>
              <button
                onClick={onExploreLock}
                aria-label="View on block explorer"
                className="bg-ui-main-100 hover:bg-ui-main-200 text-ui-main-500 rounded-md p-2"
              >
                <ExploreIcon size={20} />
              </button>
              {isAvailableOnOpenSea && (
                <button
                  onClick={onOpenSea}
                  aria-label="View on OpenSea"
                  className="bg-ui-main-100 hover:bg-ui-main-200 text-ui-main-500 rounded-md p-2"
                >
                  <OpenSeaIcon size={20} />
                </button>
              )}
              <button
                onClick={() => setShowMoreInfo((value) => !value)}
                aria-label="More information"
                className="bg-ui-main-100 hover:bg-ui-main-200 text-ui-main-500 rounded-md p-2"
              >
                <InfoIcon size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <KeyInfoDrawer
        isOpen={showMoreInfo}
        setIsOpen={setShowMoreInfo}
        owner={owner}
        lock={ownedKey.lock}
        tokenId={ownedKey.tokenId}
        network={network}
        expiration={ownedKey.expiration}
        imageURL={metadata.image}
      />
      <CancelAndRefundModal
        isOpen={showCancelModal}
        setIsOpen={setShowCancelModal}
        lock={ownedKey.lock}
        tokenId={ownedKey.tokenId}
        owner={owner}
        currency={symbol}
        network={network}
        onExpireAndRefund={() => setExpireAndRefunded(true)}
      />
      <QRModal
        lock={ownedKey.lock}
        isOpen={!!(showingQR && signature)}
        setIsOpen={setShowingQR}
        dismiss={() => setSignature(null)}
        sendEmail={sendEmail}
        signature={signature}
      />
      <ExtendMembershipModal
        isOpen={showExtendMembershipModal}
        setIsOpen={setShowExtendMembership}
        lock={ownedKey.lock}
        tokenId={ownedKey.tokenId}
        owner={owner}
        currency={symbol}
        network={network}
        ownedKey={ownedKey}
      />
      <TransferModal
        isOpen={showTransferModal}
        setIsOpen={setShowTransferModal}
        lock={ownedKey.lock}
        network={network}
        owner={owner}
        tokenId={ownedKey.tokenId}
        expiration={ownedKey.expiration}
      />
    </Card>
  )
}
export default Key
