import React, { useState, useContext } from 'react'
import useClipboard from 'react-use-clipboard'
import {
  AvatarImage,
  Root as Avatar,
  Fallback as AvatarFallback,
} from '@radix-ui/react-avatar'
import { MdExplore as ExploreIcon } from 'react-icons/md'
import { BsTrashFill as CancelIcon } from 'react-icons/bs'
import { BiMailSend as SendMailIcon } from 'react-icons/bi'
import styled from 'styled-components'
import {
  FaWallet as WalletIcon,
  FaQrcode as QrCodeIcon,
  FaCheckCircle as CheckIcon,
} from 'react-icons/fa'
import { RiErrorWarningFill as DangerIcon } from 'react-icons/ri'
import { Badge, Tooltip } from '@unlock-protocol/ui'
import { networks } from '@unlock-protocol/networks'
import { expirationAsDate } from '../../../utils/durations'
import { OwnedKey } from './KeychainTypes'
import QRModal from './QRModal'
import useMetadata from '../../../hooks/useMetadata'
import { WalletServiceContext } from '../../../utils/withWalletService'
import WedlockServiceContext from '../../../contexts/WedlocksContext'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { MAX_UINT } from '../../../constants'
import { ConfigContext } from '../../../utils/withConfig'
import { OpenSeaIcon } from '../../icons'
import { CancelAndRefundModal } from './CancelAndRefundModal'
import { useStorageService } from '../../../utils/withStorageService'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface KeyBoxProps {
  tokenURI: string
  lock: any
  expiration: string
  keyId: string
  network: number
  isKeyExpired: boolean
  expirationStatus: string
}

const KeyBox = ({
  tokenURI,
  lock,
  expiration,
  keyId,
  network,
  isKeyExpired,
  expirationStatus,
}: KeyBoxProps) => {
  const metadata = useMetadata(tokenURI)

  const [isCopied, setCopied] = useClipboard(lock.address, {
    successDuration: 2000,
  })
  return (
    <div>
      <header className="flex items-center gap-4">
        <Avatar className="flex items-center justify-center w-12 h-12 border rounded-full">
          <AvatarImage
            className="rounded-full"
            alt={lock.name}
            src={metadata.image}
            width={50}
            height={50}
          />
          <AvatarFallback className="uppercase" delayMs={100}>
            {lock.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{lock.name}</h3>
          <div>
            {isKeyExpired ? (
              <Badge
                variant="red"
                size="tiny"
                iconRight={<DangerIcon size={11} />}
              >
                Expired
              </Badge>
            ) : (
              <Badge
                size="tiny"
                variant="green"
                iconRight={<CheckIcon size={11} />}
              >
                Valid
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="pt-4 space-y-1">
        <p className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Token ID:</span>
          <span className="font-medium">{keyId}</span>
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Lock Address:</span>
          <div className="flex w-36 justify-between items-center gap-2 pl-2 p-0.5 border rounded">
            <span className="w-12 overflow-hidden font-medium text-ellipsis">
              {lock.address}
            </span>
            <button
              onClick={setCopied}
              type="button"
              className="flex items-center px-4 text-gray-600 border rounded hover:text-black hover:border-gray-300 bg-gray-50"
            >
              {isCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Network:</span>
          <span className="font-medium">{networks[network].name}</span>
        </p>
        {expiration !== MAX_UINT && (
          <>
            <p className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Valid:</span>
              <span className="font-medium">{expirationStatus}</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export interface Props {
  ownedKey: OwnedKey
  account: string
  network: number
}

const Key = ({ ownedKey, account, network }: Props) => {
  const { lock, expiration, tokenURI, keyId } = ownedKey
  const walletService = useContext(WalletServiceContext)
  const wedlockService = useContext(WedlockServiceContext)
  const { watchAsset } = useContext(AuthenticationContext)
  const config = useContext(ConfigContext)
  const expirationStatus = expirationAsDate(expiration)
  const isKeyExpired = expirationStatus.toLocaleLowerCase() === 'expired'

  const [error, setError] = useState<string | null>(null)
  const [showingQR, setShowingQR] = useState(false)
  const [signature, setSignature] = useState<any | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const storageService = useStorageService()

  const handleSignature = async () => {
    setError('')
    const payload = JSON.stringify({
      network,
      account,
      lockAddress: lock.address,
      timestamp: Date.now(),
    })
    const signature = await walletService.signMessage(payload, 'personal_sign')
    setSignature({
      payload,
      signature,
    })
    setShowingQR(true)
  }

  const addToWallet = async () => {
    watchAsset({
      address: lock.address,
      symbol: 'KEY',
      image: `${config.services.storage.host}/lock/${lock.address}/icon`,
    })
  }

  async function exploreLock() {
    window.open(networks[network].explorer?.urls.address(lock.address))
  }

  const viewOnOpenSea = async () => {
    if (network === 137) {
      window.open(
        `https://opensea.io/assets/matic/${lock.address}/${keyId}`,
        '_blank'
      )
    } else if (network === 1) {
      window.open(
        `https://opensea.io/assets/${lock.address}/${keyId}`,
        '_blank'
      )
    } else if (network === 4) {
      window.open(
        `https://testnets.opensea.io/assets/${lock.address}/${keyId}`,
        '_blank'
      )
    }
  }

  const onCancelAndRefund = () => {
    setShowCancelModal(true)
  }

  const closeCancelAndRefund = () => {
    setShowCancelModal(false)
  }

  const iconButtonClass =
    'flex items-center disabled:opacity-50 disabled:border-gray-200 disabled:cursor-not-allowed p-2 border border-gray-100 rounded shadow opacity-90 hover:opacity-100 hover:border-gray-200'
  const sendEmail = (recipient: string, qrImage: string) => {
    if (wedlockService) {
      try {
        wedlockService.keychainQREmail(
          recipient,
          `${window.location.origin}/keychain`,
          lock.name,
          qrImage
        )
      } catch {
        setError('We could not send the email. Please try again later')
      }
    } else {
      setError('We could not send the email. Please try again later')
    }
  }

  const onSendQrCode = async () => {
    if (!network) return
    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network,
    })
    const res = await storageService.sendKeyQrCodeViaEmail({
      lockAddress: lock.address,
      network,
      tokenId: keyId,
    })

    if (res.message) {
      ToastHelper.error(res.error)
    } else {
      ToastHelper.success('QR-code sent via email')
    }
  }

  const isAvailableOnOpenSea = [1, 4, 137].indexOf(network) > -1
  const baseCurrencySymbol =
    walletService.networks[network].baseCurrencySymbol ?? ''

  return (
    <div className="p-6 bg-white border border-gray-100 shadow shadow-gray-200 rounded-xl">
      <CancelAndRefundModal
        active={showCancelModal}
        lock={lock}
        keyId={keyId}
        dismiss={closeCancelAndRefund}
        account={account}
        currency={baseCurrencySymbol}
      />
      {signature && (
        <QRModal
          active={showingQR}
          dismiss={() => setSignature(null)}
          sendEmail={sendEmail}
          signature={signature}
        />
      )}
      <KeyBox
        network={network}
        lock={lock}
        expiration={expiration}
        tokenURI={tokenURI}
        keyId={keyId}
        isKeyExpired={isKeyExpired}
        expirationStatus={expirationStatus}
      />
      {error && <Error>{error}</Error>}
      <div className="grid gap-2 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {!isKeyExpired && (
            <>
              <Tooltip label="Scan QR code" tip="Scan QR code">
                <button
                  className={iconButtonClass}
                  type="button"
                  onClick={handleSignature}
                >
                  <QrCodeIcon />
                </button>
              </Tooltip>
              <Tooltip
                label="Send QR code via Email"
                tip="Send QR code via Email"
              >
                <button
                  className={iconButtonClass}
                  type="button"
                  onClick={onSendQrCode}
                >
                  <SendMailIcon />
                </button>
              </Tooltip>
            </>
          )}
          <Tooltip label="Add to Wallet" tip="Add to Wallet">
            <button
              className={iconButtonClass}
              type="button"
              onClick={addToWallet}
            >
              <WalletIcon />
            </button>
          </Tooltip>
          <Tooltip label="Explore lock" tip="Explore lock">
            <button
              className={iconButtonClass}
              type="button"
              onClick={exploreLock}
            >
              <ExploreIcon />
            </button>
          </Tooltip>
          <Tooltip label="Open on Opensea" tip="Open on Opensea">
            <button
              className={iconButtonClass}
              type="button"
              disabled={!isAvailableOnOpenSea}
              onClick={viewOnOpenSea}
            >
              <OpenSeaIcon />
            </button>
          </Tooltip>
          {!isKeyExpired && (
            <Tooltip label="Cancel and Refund" tip="Cancel and Refund">
              <button
                aria-label="Cancel and Refund"
                className={iconButtonClass}
                type="button"
                onClick={onCancelAndRefund}
              >
                <CancelIcon />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}
export default Key
const Error = styled.p`
  color: var(--red);
`
