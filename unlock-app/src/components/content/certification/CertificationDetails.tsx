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

interface CertificationDetailsProps {
  lockAddress: string
  network: number
  tokenId?: string
}

const CertificationManagerOptions = ({
  lockAddress,
  network,
  isManager,
  onEdit,
}: CertificationDetailsProps & { isManager: boolean; onEdit: () => void }) => {
  if (!isManager) return null

  return (
    <div className="grid gap-6 mt-12">
      <span className="text-2xl font-bold text-brand-dark">
        Tools for you, the certificate issuer
      </span>
      <div className="grid gap-4">
        <div className="grid w-full grid-cols-1 p-6 bg-white border border-gray-200 md:items-center md:grid-cols-3 rounded-2xl">
          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="text-lg font-bold text-brand-ui-primary">
              Certification detail
            </span>
            <span>
              Need to change something? Access your contract (Lock) & update
              detail
            </span>
          </div>
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
        </div>
        <Disclosure
          label=" Airdrop certificates"
          description="Automatically send certification to recipient by wallet address or
              email"
        >
          <AirdropForm lockAddress={lockAddress} network={network} />
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
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })

  const onEdit = () => {
    return router.push(
      `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
    )
  }

  const {
    data: key,
    isPlaceholderData,
    isFetched,
  } = useCertification({
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
      account,
    })

  const loading =
    (isMetadataLoading && !isFetched) ||
    isLoadingLockManager ||
    isHasValidKeyLoading

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

  if (!metadata?.attributes) {
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
    return <p>This contract is not configured.</p>
  }

  const certificationData = toFormData(metadata)

  const transactionsHash: string = key?.transactionsHash?.[0] || '22'

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

  const Header = () => {
    if (tokenId && key) {
      if (isLockManager) {
        return (
          <span>
            Here is the certificate that you issued to the recipient. This image
            is as off-chain image which allow recipient to share on their
            professional network.
          </span>
        )
      } else if (account === key?.owner) {
        return (
          <span>
            Here is the certificate you have received. This image is as
            off-chain image to display in a certificate format. Please refer the
            NFT link for on-chain validation.
          </span>
        )
      } else {
        return (
          <span>
            You are viewing the certificate issued to the recipient.{' '}
            <Link
              className="font-semibold text-gray-800 hover:text-brand-ui-primary"
              href="/certification"
            >
              Learn more
            </Link>{' '}
            about Certification by Unlock Labs.
          </span>
        )
      }
    } else if (key) {
      if (isLockManager) {
        return (
          <span>
            Here is the template when recipient receive certificate from you.
            They can connect wallet at this page & share the certification image
            to the professional network.
          </span>
        )
      } else {
        return (
          <span>
            You are viewing a off-chain certification sample. Please connect
            your wallet if you have received the certificate NFT or{' '}
            <Link
              className="font-semibold text-gray-800 hover:text-brand-ui-primary"
              href="/certification"
            >
              Learn more
            </Link>{' '}
            about Certification by Unlock Labs.
          </span>
        )
      }
    } else {
      return <span>No valid certification</span>
    }
  }

  const canShareOrDownload =
    (key?.owner === account || isLockManager) && key && !isPlaceholderData

  const showCertification = key || (tokenId && key)

  const injectedProvider = selectProvider(config)
  const paywallConfig = {
    locks: {
      [lockAddress]: {
        network,
        emailRequired: true,
      },
    },
  }

  const badge =
    isLockManager || !account
      ? isLockManager
        ? 'Template'
        : 'Sample'
      : undefined

  const expiration =
    key?.expiration !== MAX_UINT
      ? isPlaceholderData
        ? key?.expiration
        : expirationAsDate(key?.expiration)
      : undefined

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
              // @ts-expect-error
              <ReactMarkdown>{certificationData.description}</ReactMarkdown>
            }
            image={certificationData.image}
            lockAddress={lockAddress}
            badge={badge}
            issuer={
              certificationData.certification?.certification_issuer as string
            }
            owner={!hasValidKey ? key?.owner : addressMinify(key?.owner)}
            expiration={expiration}
            transactionsHash={<TransactionHashButton />}
            externalUrl={certificationData.external_url}
          />
        )}

        {canShareOrDownload && (
          <ul className="flex gap-4 mx-auto">
            {tokenId && (
              <li>
                <LinkedinShareButton
                  metadata={metadata}
                  lockAddress={lockAddress}
                  network={network}
                  tokenId={tokenId}
                />
              </li>
            )}
          </ul>
        )}

        {Number(key?.lock?.maxNumberOfKeys) > 0 && !accountHasKey && (
          <div>
            <Button
              onClick={() => setCheckoutOpen(true)}
              className="mx-auto"
              variant="outlined-primary"
            >
              Claim this certificate
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
