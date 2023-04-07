import { ReactNode } from 'react'
import { Detail } from '../Detail/Detail'
import { Icon } from '../Icon/Icon'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import networks from '@unlock-protocol/networks'
import { Link } from '../Link/Link'

interface CertificateProps {
  name: string
  description: ReactNode
  owner: string
  lockAddress: string
  network: number
  expiration?: string
  issuer: string
  image?: string
  issueDate?: string
  tokenId?: string
  badge?: string
  transactionsHash?: ReactNode
  externalUrl?: string
}

export const Certificate = ({
  badge,
  name,
  description,
  owner,
  issueDate,
  network,
  expiration,
  tokenId,
  issuer,
  lockAddress,
  transactionsHash,
  externalUrl,
  image,
}: CertificateProps) => {
  return (
    <div className="relative grid grid-cols-1 overflow-hidden border border-gray-200 shadow-md md:grid-cols-3">
      {badge && (
        <div className="absolute flex bg-gradient-to-t from-[#603DEB] to-[#27C1D6] h-12 w-80 text-center -rotate-45 bottom-[50px] -right-[80px]">
          <span className="m-auto text-3xl font-bold text-white">{badge}</span>
        </div>
      )}
      <div className="flex flex-col col-span-2 gap-10 px-6 py-6 md:gap-24 md:px-12 md:py-11">
        <div>
          <h2 className="text-xl font-bold uppercase md:text-4xl">
            Certificate
          </h2>
          <div className="flex flex-col gap-6 mt-3">
            {issueDate && (
              <span className="text-sm font-semibold">{issueDate}</span>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-700">This is to certify</span>
              <span className="text-base font-bold text-brand-dark">
                {owner}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-700">has completed</span>
              <span className="text-base font-bold text-brand-dark">
                {name}
              </span>
              {description && (
                <div className="text-xs text-gray-700 markdown">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="grid gap-4 md:grid-cols-3 md:gap-0 md:justify-between md:flex-row">
            {expiration && (
              <Detail
                valueSize="small"
                label={
                  <span className="text-xs text-gray-600">Expiration Date</span>
                }
              >
                {expiration}
              </Detail>
            )}
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
            <Detail
              className="mt-2"
              valueSize="small"
              label={
                <span className="text-xs text-gray-600">Transaction Hash</span>
              }
            >
              {transactionsHash}
            </Detail>
          </div>

          <small className="block mt-10 text-xs text-gray-600">
            This image is an off-chain image, powered by Unlock.
          </small>
        </div>
      </div>
      <div className="h-full col-span-1">
        <div className="flex flex-col h-full">
          <div className="flex flex-col gap-4 w-full md:w-4/5 h-full bg-[#FAFBFC] md:border-l md:border-r md:border-gray-400 px-4 pb-10 md:px-6 md:pt-10">
            <img
              alt={name}
              className="w-full mb-4 overflow-hidden aspect-auto rounded-2xl"
              src={image}
            />
            {issuer && (
              <div className="text-center">
                <span className="text-xs font-semibold text-gray-600">
                  This certification is issued by
                </span>
                <h3 className="text-sm font-semibold text-brand-dark">
                  <Link
                    className="flex hover:text-brand-ui-primary"
                    href={externalUrl ?? '#'}
                    target="_blank"
                  >
                    <div className="flex items-center gap-1 mx-auto">
                      <span>{issuer}</span>
                      {externalUrl && (
                        <Icon icon={ExternalLinkIcon} size={20} />
                      )}
                    </div>
                  </Link>
                </h3>
              </div>
            )}
            <div className="mx-auto">
              <Link
                className="hover:text-brand-ui-primary"
                href={
                  networks[network]?.explorer?.urls.address(lockAddress) || '#'
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
    </div>
  )
}
