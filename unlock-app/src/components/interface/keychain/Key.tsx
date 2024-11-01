import {
  useState,
  useContext,
  Fragment,
  MouseEventHandler,
  useRef,
  useCallback,
} from 'react'
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
import {
  RiErrorWarningFill as DangerIcon,
  RiArrowGoForwardFill as ExtendMembershipIcon,
} from 'react-icons/ri'
import { BiTransfer as TransferIcon } from 'react-icons/bi'
import { Badge, Button, Card, minifyAddress } from '@unlock-protocol/ui'
import { networks } from '@unlock-protocol/networks'
import QRModal from './QRModal'
import useMetadata from '../../../hooks/useMetadata'
import WedlockServiceContext from '../../../contexts/WedlocksContext'
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
import { RiFileCopyLine as CopyLineIcon } from 'react-icons/ri'
import { ExtendMembershipModal } from './Extend'
import { Key as HookKey } from '~/hooks/useKeys'
import { TbReceipt as ReceiptIcon } from 'react-icons/tb'
import { useGetReceiptsPageUrl } from '~/hooks/useReceipts'
import { AddToPhoneWallet } from './AddToPhoneWallet'
import { useRouter } from 'next/navigation'
import { Platform } from '~/services/passService'
import { TransferModal } from './TransferModal'
import { isKeyTransferable } from '~/utils/key'
import { useFetchTransferFee } from '~/hooks/useTransferFee'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useProvider } from '~/hooks/useProvider'

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
  ownedKey: HookKey
  owner: string
  network: number
}

function Key({ ownedKey, owner, network }: Props) {
  const { lock, expiration, tokenId, isExpired, isExtendable, isRenewable } =
    ownedKey
  const { account } = useAuthenticate()
  const { getWalletService, watchAsset } = useProvider()
  const wedlockService = useContext(WedlockServiceContext)
  const web3Service = useWeb3Service()
  const config = useConfig()
  const [showingQR, setShowingQR] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [signature, setSignature] = useState<any | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [expireAndRefunded, setExpireAndRefunded] = useState(false)
  const [showExtendMembershipModal, setShowExtendMembership] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const videoRef = useRef(null)
  const [canPlayImageAsVideo, setCanPlayImageAsVideo] = useState(false)
  const isKeyExpired = isExpired || expireAndRefunded

  const { data: lockData, isPending: isLockDataLoading } = useQuery({
    queryKey: ['lock', lock.address, network],
    queryFn: () => {
      return web3Service.getLock(lock.address, network)
    },
  })
  const metadata = useMetadata(lock.address, tokenId, network)
  const [_, setCopied] = useClipboard(lock.address, {
    successDuration: 2000,
  })

  let isTransferable
  const {
    isLoading: transferFeeLoading,
    error: transferfeeError,
    data: transferFee,
  } = useFetchTransferFee({
    lockAddress: lock.address,
    network: network,
  })
  if (
    !transferFeeLoading &&
    !transferfeeError &&
    typeof transferFee === 'number'
  ) {
    isTransferable = isKeyTransferable(transferFee)
  }

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
      tokenId,
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

  const router = useRouter()

  const { opensea } = networks[network] ?? {}

  const isAvailableOnOpenSea = !!opensea?.tokenUrl(lock.address, tokenId)

  const baseSymbol = config.networks[network].nativeCurrency.symbol!
  const symbol =
    isLockDataLoading || !lockData
      ? baseSymbol
      : lockTickerSymbol(lockData, baseSymbol)

  const isRefundable = !isLockDataLoading && !isKeyExpired

  const networkName = networks[ownedKey.network]?.name

  const { isPending: isLoadingUrl, data: receiptsPageUrl } =
    useGetReceiptsPageUrl({
      lockAddress: lock.address,
      network,
      tokenId,
    })

  const onReceiptsPage = () => {
    if (!receiptsPageUrl) {
      return
    }

    router.push(receiptsPageUrl)
  }

  const checkIfImageUrlIsVideo = async () => {
    const video = videoRef.current
    if (video) {
      try {
        await (video as HTMLVideoElement).play()
        setCanPlayImageAsVideo(true)
      } catch (error) {
        setCanPlayImageAsVideo(false)
      }
    }
  }

  const onLoadingStatusChangeOfImage = useCallback((status: string) => {
    if (status === 'error') {
      checkIfImageUrlIsVideo()
    }
  }, [])

  return (
    <Card className="grid gap-6" shadow="lg" padding="xs">
      <KeyInfoDrawer
        isOpen={showMoreInfo}
        setIsOpen={setShowMoreInfo}
        owner={owner}
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
        owner={owner}
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
        owner={owner}
        currency={symbol}
        network={network}
        ownedKey={ownedKey}
      />
      <TransferModal
        isOpen={showTransferModal}
        setIsOpen={setShowTransferModal}
        lock={lock}
        network={network}
        owner={owner}
        tokenId={tokenId}
        expiration={expiration}
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
          {owner == account && (
            <button
              aria-label="QR Code"
              className="inline-flex items-center gap-2 p-2 border rounded-full border-brand-dark hover:bg-gray-50"
              type="button"
              onClick={handleQRCodeSignature}
            >
              <QrCodeIcon size={18} />
            </button>
          )}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button as={Fragment}>
              <Button
                size="small"
                variant="outlined-primary"
                iconLeft={<ToolsIcon key="options" />}
              >
                Actions
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
                  {owner == account && (
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
                  {owner == account && receiptsPageUrl?.length && (
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
                  {/* This should go in the details modal! */}
                  {owner == account && (
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
                {owner == account && (
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
                {owner == account && tokenId && (
                  <div className="p-1">
                    <Menu.Item>
                      {() => (
                        <div className="flex flex-row gap-1">
                          <AddToPhoneWallet
                            platform={Platform.GOOGLE}
                            as={MenuButton}
                            network={network}
                            lockAddress={lock.address}
                            tokenId={tokenId}
                            handlePassUrl={(url: string) => {
                              window.location.assign(url)
                            }}
                          />
                          <AddToPhoneWallet
                            platform={Platform.APPLE}
                            as={MenuButton}
                            network={network}
                            lockAddress={lock.address}
                            tokenId={tokenId}
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
            className="w-full h-full rounded-xl aspect-1 max-h-72 max-w-72 object-contain	"
            alt={lock.name!}
            src={metadata.image}
            width={250}
            height={250}
            onLoadingStatusChange={onLoadingStatusChangeOfImage}
          />
          <AvatarFallback
            className="flex flex-col items-center justify-center text-3xl font-bold uppercase rounded-xl aspect-1 h-72 w-72"
            delayMs={100}
          >
            {!canPlayImageAsVideo && <>{lock?.name?.slice(0, 2)}</>}
            <video
              className="w-full h-full rounded-xl aspect-1 max-h-72 max-w-72"
              muted
              playsInline
              src={metadata.image}
              ref={videoRef}
              style={{ display: canPlayImageAsVideo ? 'block' : 'none' }}
            />
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center justify-between text-sm">
          {networkName && (
            <div className="flex items-center justify-between gap-2 py-1">
              <span className="">{networkName}</span>
            </div>
          )}
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
          </div>{' '}
        </div>
        <h3 className="text-xl font-bold rounded">{lock.name}</h3>
      </div>
    </Card>
  )
}
export default Key
