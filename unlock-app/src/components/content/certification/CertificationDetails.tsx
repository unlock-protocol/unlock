import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { useMetadata } from '~/hooks/metadata'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import {
  Button,
  Detail,
  Disclosure,
  Icon,
  Placeholder,
} from '@unlock-protocol/ui'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { networks } from '@unlock-protocol/networks'
import { addressMinify } from '~/utils/strings'
import { expirationAsDate } from '~/utils/durations'
import { RiDownloadLine as DownloadIcon } from 'react-icons/ri'
import { useAuth } from '~/contexts/AuthenticationContext'
import { MAX_UINT } from '~/constants'
import { AirdropForm } from '~/components/interface/members/airdrop/AirdropDrawer'
import LinkedinShareButton from './LinkedInShareButton'
import { useCertification } from '~/hooks/useCertification'

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
          <div className="flex flex-col md:col-span-2">
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

  const loading = (isMetadataLoading && !isFetched) || isLoadingLockManager

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

  const Badge = () => {
    if (isLockManager || !account) {
      return (
        <div className="absolute flex bg-gradient-to-t from-[#603DEB] to-[#27C1D6] h-12 w-80 text-center -rotate-45 bottom-[50px] -right-[80px]">
          <span className="m-auto text-3xl font-bold text-white">
            {isLockManager ? 'Template' : 'Sample'}
          </span>
        </div>
      )
    }
    return null
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

  const canShareOrDownload = key?.owner === account || isLockManager

  const showCertification = key || (tokenId && key)

  return (
    <main className="mt-8 ">
      <div className="flex flex-col gap-6">
        <Header />
        <div
          className={`relative grid grid-cols-1 overflow-hidden lg:grid-cols-3 ${
            showCertification ? 'border border-gray-200 shadow-md' : ''
          }`}
        >
          <Badge />
          {showCertification && (
            <>
              <div className="flex flex-col col-span-2 gap-10 px-6 py-6 md:gap-24 md:px-12 md:py-11">
                <div>
                  <h2 className="text-xl font-bold uppercase md:text-4xl">
                    Certificate
                  </h2>
                  <div className="flex flex-col gap-6 mt-3">
                    <span className="text-sm font-semibold">
                      {!hasValidKey ? '{Issue date}' : 'Apr 1, 2023'}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-700">
                        This is to certify
                      </span>
                      <span className="text-base font-bold text-brand-dark">
                        {!hasValidKey ? key?.owner : addressMinify(key?.owner)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-700">
                        has completed
                      </span>
                      <span className="text-base font-bold text-brand-dark">
                        {certificationData.name}
                      </span>
                      {certificationData.description && (
                        <div className="text-xs text-gray-700 markdown">
                          <ReactMarkdown>
                            {certificationData.description}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="grid gap-4 md:grid-cols-3 md:gap-0 md:justify-between md:flex-row">
                    {key?.expiration !== MAX_UINT && (
                      <Detail
                        valueSize="small"
                        label={
                          <span className="text-xs text-gray-600">
                            Expiration Date
                          </span>
                        }
                      >
                        {isPlaceholderData
                          ? key?.expiration
                          : expirationAsDate(key?.expiration)}
                      </Detail>
                    )}
                    <Detail
                      valueSize="small"
                      label={
                        <span className="text-xs text-gray-600">Network</span>
                      }
                    >
                      {networks[network].name}
                    </Detail>
                    <Detail
                      valueSize="small"
                      label={
                        <span className="text-xs text-gray-600">
                          Certification/Token ID
                        </span>
                      }
                    >
                      {key?.tokenId}
                    </Detail>
                    <Detail
                      className="mt-2"
                      valueSize="small"
                      label={
                        <span className="text-xs text-gray-600">
                          Transaction Hash
                        </span>
                      }
                    >
                      {isPlaceholderData ? (
                        transactionsHash
                      ) : (
                        <Link
                          className="flex items-center gap-2 hover:text-brand-ui-primary"
                          target="_blank"
                          rel="noreferrer"
                          href={
                            networks[network].explorer?.urls?.transaction(
                              transactionsHash
                            ) || '#'
                          }
                        >
                          <span>{addressMinify(transactionsHash)}</span>
                          <Icon icon={ExternalLinkIcon} size={18} />
                        </Link>
                      )}
                    </Detail>
                  </div>

                  <small className="block mt-10 text-xs text-gray-600">
                    This image is an off-chain image, Powered by Unlock. <br />{' '}
                    Please verify transaction hash for validation.
                  </small>
                </div>
              </div>
              <div className="h-full col-span-1">
                <div className="flex flex-col h-full">
                  <div className="flex flex-col gap-4 w-full md:w-4/5 h-full bg-[#FAFBFC] md:border-l md:border-r md:border-gray-400 px-4 pb-10 md:px-6 md:pt-10">
                    <img
                      alt={certificationData.title}
                      className="w-full mb-4 overflow-hidden aspect-auto rounded-2xl"
                      src={certificationData.image}
                    />
                    <div className="text-center">
                      <span className="text-xs font-semibold text-gray-600">
                        This certification is issued by
                      </span>
                      <h3 className="text-sm font-semibold text-brand-dark">
                        <Link
                          className="flex hover:text-brand-ui-primary"
                          href={metadata.external_url ?? '#'}
                          target="_blank"
                        >
                          <div className="flex items-center gap-1 mx-auto">
                            <span>
                              {
                                certificationData?.certification
                                  ?.certification_issuer
                              }
                            </span>
                            {metadata.external_url && (
                              <Icon icon={ExternalLinkIcon} size={20} />
                            )}
                          </div>
                        </Link>
                      </h3>
                    </div>
                    <div className="mx-auto">
                      <Link
                        className="hover:text-brand-ui-primary"
                        href={
                          networks[network]?.explorer?.urls.address(
                            lockAddress
                          ) || '#'
                        }
                        target="_blank"
                      >
                        <div className="flex items-center gap-1">
                          <span>View contact</span>
                          <Icon icon={ExternalLinkIcon} size={20} />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
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
            <li className="text-gray-900">
              <DownloadIcon
                className="text-gray-900 opacity-50 cursor-pointer hover:opacity-100"
                size={30}
              />
            </li>
          </ul>
        )}
      </div>

      <div></div>

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
