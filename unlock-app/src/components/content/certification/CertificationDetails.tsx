import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { useMetadata } from '~/hooks/metadata'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { Button, Detail, Icon, Placeholder } from '@unlock-protocol/ui'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { networks } from '@unlock-protocol/networks'
import { addressMinify } from '~/utils/strings'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { expirationAsDate } from '~/utils/durations'
import { IoLogoLinkedin as LinkedinIcon } from 'react-icons/io'
import { RiDownloadLine as DownloadIcon } from 'react-icons/ri'

interface CertificationDetailsProps {
  lockAddress: string
  network: number
  tokenId: string
}

export const CertificationDetails = ({
  lockAddress,
  network,
  tokenId,
}: CertificationDetailsProps) => {
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })

  const { isLoading, data: key } = useQuery(
    ['getLockKey', lockAddress, network],
    async () => {
      const subgraph = new SubgraphService()
      return await subgraph.key(
        {
          where: {
            tokenId,
            lock_in: [lockAddress.toLowerCase()],
          },
        },
        {
          network,
        }
      )
    },
    {
      enabled: !!lockAddress && !!network && !!tokenId,
    }
  )

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  const onEdit = () => {
    return router.push(
      `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
    )
  }

  if (isLoading || isMetadataLoading) {
    return (
      <Placeholder.Root>
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

  const transactionsHash: string = key?.transactionsHash?.[0] || ''

  return (
    <main className="mt-8 ">
      <div className="flex flex-col gap-6">
        <span className="text-base md:text-lg">
          Here is the certificate you have received. This image is as off-chain
          image to display in a certificate format. Please refer the NFT link
          for on-chain validation.
        </span>
        <div className="relative grid grid-cols-1 overflow-hidden border border-gray-200 shadow-md md:grid-cols-3">
          {!tokenId && (
            <div className="absolute flex bg-gradient-to-t from-[#603DEB] to-[#27C1D6] h-12 w-80 text-center -rotate-45 bottom-[50px] -right-[80px]">
              <span className="m-auto text-3xl font-bold text-white">
                Sample
              </span>
            </div>
          )}
          <div className="flex flex-col col-span-2 gap-10 px-6 py-6 md:gap-24 md:px-12 md:py-11">
            <div>
              <h2 className="text-xl font-bold uppercase md:text-4xl">
                Certificate
              </h2>
              <div className="flex flex-col gap-6 mt-3">
                <span className="text-sm font-semibold">Apr 1, 2023</span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-700">
                    This is to certify
                  </span>
                  <span className="text-base font-bold text-brand-dark">
                    {addressMinify(key?.owner)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-700">has completed</span>
                  <span className="text-base font-bold text-brand-dark">
                    {certificationData.name}
                  </span>
                  {certificationData.description && (
                    <div className="text-xs text-gray-700 markdown">
                      {/* eslint-disable-next-line react/no-children-prop */}
                      <ReactMarkdown children={certificationData.description} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-4 md:gap-0 md:justify-between md:flex-row">
                <Detail
                  valueSize="small"
                  label={
                    <span className="text-xs text-gray-600">
                      Expiration Date
                    </span>
                  }
                >
                  {expirationAsDate(key?.expiration)}
                </Detail>
                <Detail
                  valueSize="small"
                  label={<span className="text-xs text-gray-600">Network</span>}
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
                  {tokenId}
                </Detail>
              </div>
              <Detail
                className="mt-2"
                valueSize="small"
                label={
                  <span className="text-xs text-gray-600">
                    Transaction Hash
                  </span>
                }
              >
                {addressMinify(transactionsHash)}
              </Detail>
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
                    Unlock Protocol
                  </h3>
                </div>
                <div className="mx-auto">
                  <Link className="hover:text-brand-ui-primary" href="#">
                    <Icon icon={ExternalLinkIcon} size={24} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ul className="flex gap-4 mx-auto">
          <li>
            <LinkedinIcon
              className="text-gray-900 opacity-50 cursor-pointer hover:opacity-100"
              size={30}
            />
          </li>
          <li className="text-gray-900">
            <DownloadIcon
              className="text-gray-900 opacity-50 cursor-pointer hover:opacity-100"
              size={30}
            />
          </li>
        </ul>
      </div>

      <section className="flex flex-col mb-8">
        {isLockManager && (
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
                    Need to change something? Access your contract (Lock) &
                    update detail
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
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
