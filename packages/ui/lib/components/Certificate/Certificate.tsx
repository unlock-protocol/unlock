import { ReactNode } from 'react'
import networks from '@unlock-protocol/networks'
import { Link } from '../Link/Link'
import { minifyAddress } from '~/utils'
import { Size } from '~/types'

interface CertificateProps {
  name: string
  description: ReactNode
  owner: string
  lockAddress: string
  network: number
  expiration?: string
  issuer: string
  image: string
  issueDate?: string
  tokenId?: string | number
  badge?: string
  transactionsHash?: ReactNode
  externalUrl?: string
}

interface Props {
  children?: ReactNode
  size?: Size
}

const ValueWrapper = ({ children }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {children}
    </div>
  )
}
const CertificateLabel = ({ children }: Props) => {
  return (
    <span
      style={{
        color: '#374151',
        fontSize: '12px',
        lineHeight: '16px',
      }}
    >
      {children}
    </span>
  )
}
const CertificateValue = ({ children, size = 'medium' }: Props) => {
  const sizes: Record<Size, any> = {
    tiny: '12px',
    small: '14px',
    medium: '16px',
    large: '24px',
  }

  const weights: Record<Size, any> = {
    tiny: 500,
    small: 600,
    medium: 600,
    large: 700,
  }

  return (
    <span
      style={{
        fontSize: sizes[size],
        fontWeight: weights[size],
      }}
    >
      {children}
    </span>
  )
}

const Badge = ({ children }: Props) => {
  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        background: 'linear-gradient(85.7deg, #603DEB 3.25%, #27C1D6 90.24%)',
        height: '48px',
        width: '320px',
        textAlign: 'center',
        transform: 'rotate(-45deg)',
        right: '-80px',
        bottom: '50px',
      }}
    >
      <span
        style={{
          margin: 'auto',
          fontSize: '30px',
          lineHeight: '36px',
          color: 'white',
        }}
      >
        {children}
      </span>
    </div>
  )
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
  const mediaMatch = window.matchMedia('(min-width: 500px)')
  const isMobile = !mediaMatch.matches

  return (
    <div
      style={{
        position: 'relative',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
      }}
    >
      {badge && <Badge>{badge}</Badge>}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gridColumn: 'span 2 / span 2',
          gap: isMobile ? '40px' : '96px',
          padding: isMobile ? '24px' : '44px 48px',
          marginTop: '12px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: isMobile ? '20px' : '36px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Certificate
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              marginTop: '12px',
            }}
          >
            {issueDate && <CertificateValue>{issueDate}</CertificateValue>}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <CertificateLabel>This is to certify</CertificateLabel>
              <CertificateValue>{minifyAddress(owner)}</CertificateValue>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <CertificateLabel>has completed</CertificateLabel>
              <CertificateValue size="large">{name}</CertificateValue>
              {description && (
                <div
                  style={{
                    marginTop: '10px',
                  }}
                >
                  <CertificateLabel>{description}</CertificateLabel>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'repeat(3, minmax(0, 1fr))',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              gap: isMobile ? '16px' : 0,
            }}
          >
            {expiration && (
              <ValueWrapper>
                <CertificateLabel>Expiration Date</CertificateLabel>
                <CertificateValue>{expiration}</CertificateValue>
              </ValueWrapper>
            )}
            <ValueWrapper>
              <CertificateLabel>Network</CertificateLabel>
              <CertificateValue> {networks[network].name}</CertificateValue>
            </ValueWrapper>
            <ValueWrapper>
              <CertificateLabel>Certification/Token ID</CertificateLabel>
              <CertificateValue>{tokenId}</CertificateValue>
            </ValueWrapper>
            <ValueWrapper>
              <CertificateLabel>Transaction Hash</CertificateLabel>
              <CertificateValue>{transactionsHash}</CertificateValue>
            </ValueWrapper>
          </div>

          <div
            style={{
              marginTop: '40px',
            }}
          >
            <CertificateLabel>
              This image is an off-chain image, powered by Unlock.
            </CertificateLabel>
          </div>
        </div>
      </div>
      <div
        style={{
          height: '100%',
          gridColumn: 'span 1 / span 1',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              height: '100%',
              flexDirection: 'column',
              gap: '16px',
              width: isMobile ? '100%' : '80%',
              background: '#FAFBFC',
              borderRight: isMobile ? 'none' : '1px solid #9ca3af',
              borderLeft: isMobile ? 'none' : '1px solid #9ca3af',
              padding: isMobile ? '0 16px 40px 16px' : '40px 24px 0 24px',
            }}
          >
            <img
              style={{
                width: '100%',
                marginBottom: '10px',
                aspectRatio: 'auto',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
              alt={name}
              src={image}
            />
            {issuer && (
              <div
                style={{
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#4b5563',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: 600,
                  }}
                >
                  This certification is issued by
                </div>
                <CertificateValue>
                  <Link
                    style={{
                      display: 'flex',
                    }}
                    className="hover:text-brand-ui-primary"
                    href={externalUrl ?? '#'}
                    target="_blank"
                  >
                    <div
                      style={{
                        display: 'flex',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        gap: '4px',
                        alignItems: 'center',
                      }}
                    >
                      <span>{minifyAddress(issuer)}</span>
                    </div>
                  </Link>
                </CertificateValue>
              </div>
            )}
            <div
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <Link
                className="hover:text-brand-ui-primary"
                href={
                  networks[network]?.explorer?.urls.address(lockAddress) || '#'
                }
                target="_blank"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      color: '#6b7280',
                    }}
                  >
                    View contact
                  </span>
                  <svg
                    style={{
                      width: '20px',
                      height: '20px',
                    }}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_285_201)">
                      <path
                        d="M7.79287 4.44529V5.81384H4.37148V13.3409H11.8985V9.9195H13.2671V14.0252C13.2671 14.2066 13.195 14.3807 13.0667 14.509C12.9383 14.6373 12.7643 14.7094 12.5828 14.7094H3.68721C3.50572 14.7094 3.33168 14.6373 3.20335 14.509C3.07502 14.3807 3.00293 14.2066 3.00293 14.0252V5.12956C3.00293 4.94808 3.07502 4.77403 3.20335 4.64571C3.33168 4.51738 3.50572 4.44529 3.68721 4.44529H7.79287ZM15.3199 2.39246V7.86667H13.9514V4.72789L8.61879 10.0611L7.65122 9.09358L12.9831 3.76101H9.8457V2.39246H15.3199Z"
                        fill="#75797E"
                      />
                    </g>
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
