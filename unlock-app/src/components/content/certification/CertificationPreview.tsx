'use client'

import Link from 'next/link'
import { useMetadata } from '~/hooks/metadata'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { Icon, Placeholder, Certificate } from '@unlock-protocol/ui'
import ReactMarkdown from 'react-markdown'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { networks } from '@unlock-protocol/networks'
import { addressMinify } from '~/utils/strings'
import { expirationAsDate } from '~/utils/durations'
import { MAX_UINT } from '~/constants'
import LinkedinShareButton from './LinkedInShareButton'
import { useCertification } from '~/hooks/useCertification'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface CertificationPreviewProps {
  lockAddress?: string
  network?: number
  tokenId?: string
  expiration?: string | number
}

export const CertificationPreviewContent = ({
  lockAddress,
  network,
  tokenId,
}: CertificationPreviewProps) => {
  const { account } = useAuthenticate()

  // Get the metadata for the certification
  const { data: metadata, isLoading: isMetadataLoading } = useMetadata({
    lockAddress: lockAddress!,
    network: network!,
    keyId: tokenId!,
  })

  const { data: certification } = useCertification({
    lockAddress: lockAddress!,
    network: network!,
    tokenId: tokenId!,
  })

  const loading = isMetadataLoading

  // Show loading state while metadata is loading
  if (loading) {
    return (
      <Placeholder.Root className="mt-8">
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

  const certificationData = toFormData(metadata!)

  const transactionsHash: string = certification?.transactionsHash?.[0] || '22'

  const isPlaceholderData = certification?.tokenId === '#'

  const hasValidKey =
    (certification && !isPlaceholderData) ||
    (isPlaceholderData && !certification)

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
              networks[network!].explorer?.urls?.transaction(
                transactionsHash
              ) || '#'
            }
          >
            <span>{addressMinify(transactionsHash)}</span>
            <Icon icon={ExternalLinkIcon} size={18} />
          </Link>
        )}
      </>
    )
  }

  const viewerIsOwner =
    account?.toLowerCase() === certification?.owner?.toLowerCase()
  const issuer = certificationData?.certification
    ?.certification_issuer as string

  const canShare = viewerIsOwner && certification && !isPlaceholderData

  const showCertification = certification || (tokenId && certification)

  const showExpiration = certification?.expiration !== MAX_UINT

  const expiration = isPlaceholderData
    ? certification?.expiration
    : expirationAsDate(certification?.expiration)

  const isMobile = window?.innerWidth < 768

  // Get all custom metadata that aren't `minted` or `certification_issuer`

  const customMetadata =
    metadata?.attributes?.filter(
      (attr: any) =>
        attr.trait_type !== 'Minted' &&
        attr.trait_type !== 'certification_issuer' &&
        attr.trait_type &&
        attr.value
    ) || []

  const certificateProps = {
    tokenId: certification?.tokenId,
    network: network!,
    name: certificationData.name,
    description: (
      <ReactMarkdown>{certificationData?.description as string}</ReactMarkdown>
    ),
    image: certificationData?.image as string,
    lockAddress: lockAddress!,
    badge: isPlaceholderData ? (
      <span className="text-xl">Preview</span>
    ) : undefined,
    issuer,
    owner: !hasValidKey
      ? certification?.owner
      : addressMinify(certification?.owner),
    expiration: showExpiration ? expiration : undefined,
    transactionsHash: <TransactionHashButton />,
    externalUrl: certificationData.external_url,
    isMobile,
    ...customMetadata,
  }

  return (
    <main className="mt-8">
      <div className="flex flex-col gap-6">
        {showCertification && <Certificate {...certificateProps} />}

        {canShare && (
          <ul className="flex gap-4 mx-auto">
            <li>
              <LinkedinShareButton
                metadata={metadata!}
                lockAddress={lockAddress!}
                network={network!}
                tokenId={certification?.tokenId}
              />
            </li>
          </ul>
        )}
      </div>
    </main>
  )
}
