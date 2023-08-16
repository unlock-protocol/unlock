import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { useMetadata } from '~/hooks/metadata'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import {
  Button,
  Disclosure,
  Icon,
  Modal,
  Placeholder,
  Certificate,
  minifyAddress,
  Card,
} from '@unlock-protocol/ui'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { networks } from '@unlock-protocol/networks'
import { addressMinify } from '~/utils/strings'
import { expirationAsDate } from '~/utils/durations'
import { useAuth } from '~/contexts/AuthenticationContext'
import { MAX_UINT } from '~/constants'
import { AirdropForm } from '~/components/interface/members/airdrop/AirdropDrawer'
import LinkedinShareButton from './LinkedInShareButton'
import { useCertification } from '~/hooks/useCertification'
import { useState } from 'react'
import { Checkout } from '~/components/interface/checkout/main'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useConfig } from '~/utils/withConfig'
import { useValidKey } from '~/hooks/useKey'
import { useTransferFee } from '~/hooks/useTransferFee'
import { useQuery } from '@tanstack/react-query'
import { WarningBar } from '~/components/interface/locks/Create/elements/BalanceWarning'
import { UpdateTransferFee } from '~/components/interface/locks/Settings/forms/UpdateTransferFee'
import { PaywallConfigType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { useLockData } from '~/hooks/useLockData'
interface CertificationDetailsProps {
  lockAddress: string
  network: number
  tokenId?: string
  expiration?: string | number
}

const CertificationManagerOptions = ({
  lockAddress,
  network,
  isManager,
  onEdit,
}: CertificationDetailsProps & { isManager: boolean; onEdit: () => void }) => {
  const { getTransferFeeBasisPoints } = useTransferFee({
    lockAddress,
    network,
  })

  const { isLoading, data: transferFeeBasisPoints } = useQuery(
    ['getTransferFeeBasisPoints', lockAddress, network],
    async () => getTransferFeeBasisPoints()
  )

  const certificationIsTransferable = transferFeeBasisPoints !== 10_000

  if (!isManager) return null

  return (
    <div className="grid gap-6 mt-12">
      <p className="text-2xl font-bold text-brand-dark">
        Tools for you, the certificate issuer
      </p>
      <div className="grid gap-4">
        {certificationIsTransferable && !isLoading && (
          <div className="flex flex-col gap-2">
            <WarningBar>
              Your certification is transferable! disable it to prevent transfer
              between users.
            </WarningBar>
            <Disclosure
              label="Make tokens non-transferable (soulbound)."
              description=" Your certification is transferable! disable it to prevent transfer
              between users."
            >
              <UpdateTransferFee
                lockAddress={lockAddress}
                network={network}
                isManager={isManager}
                disabled={!isManager}
                unlimitedDuration={false}
              />
            </Disclosure>
          </div>
        )}
        <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3 rounded-2xl">
          <Card.Label
            title="Certification details"
            description="Need to change something? Access your contract (Lock) & update its
              details."
          />
          <div className="md:col-span-1">
            <Button
              onClick={onEdit}
              variant="black"
              className="w-full border"
              size="small"
            >
              Edit Details
            </Button>
          </div>
        </Card>
        <Disclosure
          label="Airdrop certificates"
          description="Automatically send NFT certifications to wallets or by email"
        >
          <AirdropForm
            lockAddress={lockAddress}
            network={network}
            emailRequired
          />
        </Disclosure>
      </div>
    </div>
  )
}

export const CertificationDetails = ({
  lockAddress,
  network,
  tokenId,
}: CertificationDetailsProps) => {
  const { account } = useAuth()
  const config = useConfig()
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)

  const { lock, isLockLoading: isLockDataLoading } = useLockData({
    lockAddress,
    network,
  })

  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
    keyId: tokenId,
  })

  const onEdit = () => {
    return router.push(
      `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
    )
  }

  const { data: key, isFetched } = useCertification({
    lockAddress,
    network,
    tokenId,
  })

  const { isManager: isLockManager, isLoading: isLoadingLockManager } =
    useLockManager({
      lockAddress,
      network,
    })

  const { data: accountHasKey, isInitialLoading: isHasValidKeyLoading } =
    useValidKey({
      lockAddress,
      network,
    })

  const loading =
    isLockDataLoading ||
    (isMetadataLoading && !isFetched) ||
    isLoadingLockManager ||
    isHasValidKeyLoading

  const { isCertification } = getLockTypeByMetadata(metadata)

  if (loading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="sm" />
        <Placeholder.Image className="h-[600px] w-full"></Placeholder.Image>
        <Placeholder.Root>
          <div className="flex justify-center gap-6">
            <Placeholder.Image className="w-9 h-9" />
            <Placeholder.Image className="w-9 h-9" />
          </div>
        </Placeholder.Root>
      </Placeholder.Root>
    )
  }

  if (!isCertification) {
    if (isLockManager) {
      return (
        <>
          <p className="mb-2">Your certification details are not set.</p>
          <Button
            onClick={onEdit}
            variant="black"
            className="w-32 border"
            size="small"
          >
            Edit Details
          </Button>
        </>
      )
    }
    return <p>This contract is not configured for certifications.</p>
  }

  const certificationData = toFormData(metadata!)

  const transactionsHash: string = key?.transactionsHash?.[0] || '22'

  const isPlaceholderData = key?.tokenId === '#'

  const hasValidKey = (key && !isPlaceholderData) || (isPlaceholderData && !key)

  const TransactionHashButton = () => {
    return (
      <>
        {isPlaceholderData ? (
          transactionsHash
        ) : (
          <Link
            className="flex items-center gap-2 hover:text-brand-ui-primary"
            target="_blank"
            rel="noreferrer"
            href={
              networks[network].explorer?.urls?.transaction(transactionsHash) ||
              '#'
            }
          >
            <span>{addressMinify(transactionsHash)}</span>
            <Icon icon={ExternalLinkIcon} size={18} />
          </Link>
        )}
      </>
    )
  }

  const viewerIsOwner = account?.toLowerCase() === key?.owner?.toLowerCase()
  const issuer = certificationData?.certification
    ?.certification_issuer as string

  const Header = () => {
    if (key && !isPlaceholderData) {
      if (isLockManager) {
        return (
          <span>
            Here is the certificate that you issued. This image is an off-chain
            image that the recipient can share with their professional network.
          </span>
        )
      } else if (viewerIsOwner) {
        return (
          <span>
            {`Here is the certificate you have received. This image is just an
            offchain representation of the NFT.`}
          </span>
        )
      } else {
        return (
          <p>
            You are viewing a{' '}
            <span className="font-semibold">{`"${certificationData.name}"`}</span>{' '}
            issued by {issuer} for{' '}
            <Link
              href={networks[network].explorer?.urls.address(key?.owner) ?? '#'}
              className="font-semibold text-brand-ui-primary hover:underline"
            >{`${minifyAddress(key?.owner)}`}</Link>
            . <br />
            <Link
              className="font-semibold text-gray-800 hover:text-brand-ui-primary"
              href="/certification"
            >
              Learn more
            </Link>{' '}
            about Certifications by Unlock Labs.
          </p>
        )
      }
    } else if (isPlaceholderData) {
      if (isLockManager) {
        return (
          <p>
            Here is the template of one of your certifications. Once you
            airdropped one to a recipient, they can connect their wallet on this
            page and share the certification image with their professional
            network.
          </p>
        )
      } else {
        return (
          <p>
            You are viewing an off-chain{' '}
            <span className="font-semibold">{`"${certificationData.name}"`}</span>{' '}
            certification sample issued by {issuer}.{' '}
            <Link
              className="font-semibold text-brand-ui-primary hover:underline"
              href="/certification"
            >
              Learn more
            </Link>{' '}
            about Certifications by Unlock Labs.{' '}
            {!account && (
              <p>
                Connect your wallet to see if you have received a{' '}
                <span className="font-semibold">{`"${certificationData.name}"`}</span>{' '}
                issued by {issuer}.
              </p>
            )}
          </p>
        )
      }
    } else {
      return <p>This is not a valid certificate.</p>
    }
  }

  const canShareOrDownload =
    (viewerIsOwner || isLockManager) && key && !isPlaceholderData

  const showCertification = key || (tokenId && key)

  const injectedProvider = selectProvider(config)
  const paywallConfig = {
    locks: {
      [lockAddress]: {
        network,
        emailRequired: true,
      },
    },
  } as PaywallConfigType

  const showExpiration = key?.expiration !== MAX_UINT

  const expiration = isPlaceholderData
    ? key?.expiration
    : expirationAsDate(key?.expiration)

  const isMobile = window?.innerWidth < 768

  return (
    <main className="mt-8">
      <Modal isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} empty={true}>
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={paywallConfig}
          handleClose={() => setCheckoutOpen(false)}
        />
      </Modal>

      <div className="flex flex-col gap-6">
        <Header />
        {showCertification && (
          <Certificate
            tokenId={key?.tokenId}
            network={network}
            name={certificationData.name}
            description={
              <>
                {/* eslint-disable-next-line react/no-children-prop */}
                <ReactMarkdown>
                  {certificationData?.description as string}
                </ReactMarkdown>
              </>
            }
            image={certificationData?.image as string}
            lockAddress={lockAddress}
            badge={
              isLockManager ? (
                <span className="text-xl">Here is a preview</span>
              ) : undefined
            }
            issuer={issuer}
            owner={!hasValidKey ? key?.owner : addressMinify(key?.owner)}
            expiration={showExpiration ? expiration : undefined}
            transactionsHash={<TransactionHashButton />}
            externalUrl={certificationData.external_url}
            isMobile={isMobile}
          />
        )}

        {canShareOrDownload && (
          <ul className="flex gap-4 mx-auto">
            <li>
              <LinkedinShareButton
                metadata={metadata!}
                lockAddress={lockAddress}
                network={network}
                tokenId={key?.tokenId}
              />
            </li>
          </ul>
        )}

        {Number(lock?.maxNumberOfKeys) !== 0 && !accountHasKey && (
          <div>
            <Button
              onClick={() => setCheckoutOpen(true)}
              className="mx-auto"
              variant="outlined-primary"
            >
              Claim your {certificationData.name} certificate
            </Button>
          </div>
        )}
      </div>

      <section className="flex flex-col mb-8">
        {isLockManager && (
          <CertificationManagerOptions
            lockAddress={lockAddress}
            isManager={isLockManager}
            network={network}
            tokenId={tokenId}
            onEdit={onEdit}
          />
        )}
      </section>
    </main>
  )
}
