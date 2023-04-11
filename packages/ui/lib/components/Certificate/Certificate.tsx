import { ReactNode } from 'react'
import networks from '@unlock-protocol/networks'
import { minifyAddress } from '~/utils'

interface CertificateProps {
  name: string
  description: ReactNode
  owner: string
  lockAddress: string
  network: number
  networkName?: string
  expiration?: string
  issuer: string
  image: string
  issueDate?: string
  tokenId?: string | number
  badge?: string
  transactionsHash?: ReactNode
  externalUrl?: string
  isMobile?: boolean
}

interface Props {
  children?: ReactNode
  size?: string
}

const ValueWrapper = ({ children }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        textAlign: 'left',
        flex: 1,
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
        display: 'flex',
        flexDirection: 'column',
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
  const sizes: Record<any, any> = {
    tiny: '12px',
    small: '14px',
    medium: '16px',
    large: '24px',
  }

  const weights: Record<any, any> = {
    tiny: 500,
    small: 600,
    medium: 600,
    large: 700,
  }

  return (
    <span
      style={{
        display: 'flex',
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
          fontWeight: 700,
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
  networkName,
  isMobile = false,
}: CertificateProps) => {
  const networkNameById = networks[network]?.name

  return (
    <div
      style={{
        background: '#FFFDF8',
        display: 'flex',
        position: 'relative',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        minHeight: '500px',
        height: '100%',
        alignItems: 'stretch',
      }}
    >
      {badge && <Badge>{badge}</Badge>}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '40px' : '96px',
          padding: isMobile ? '24px' : '44px 48px',
          marginTop: '12px',
          height: '100%',
          flex: 2,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2
            style={{
              display: 'flex',
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
                    display: 'flex',
                    marginTop: '10px',
                  }}
                >
                  <CertificateLabel>
                    <span
                      style={{
                        display: 'flex',
                      }}
                    >
                      {description}
                    </span>
                  </CertificateLabel>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              gap: isMobile ? '16px' : 0,
              marginTop: isMobile ? '30px' : '100px',
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
              <CertificateValue>
                {networkName || networkNameById}
              </CertificateValue>
            </ValueWrapper>
            <ValueWrapper>
              <CertificateLabel>Certification/Token ID</CertificateLabel>
              <CertificateValue>{tokenId}</CertificateValue>
            </ValueWrapper>
            <ValueWrapper>
              <CertificateLabel>Transaction Hash</CertificateLabel>
              <CertificateValue>
                <div
                  style={{
                    display: 'flex',
                  }}
                >
                  {transactionsHash}
                </div>
              </CertificateValue>
            </ValueWrapper>
          </div>

          <div
            style={{
              display: 'flex',
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
          display: 'flex',
          width: '100%',
          minWidth: '300px',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              height: '100%',
              flexDirection: 'column',
              gap: '16px',
              width: isMobile ? '100%' : '300px',
              background: '#FAFBFC',
              borderRight: isMobile ? 'none' : '1px solid #9ca3af',
              borderLeft: isMobile ? 'none' : '1px solid #9ca3af',
              padding: isMobile ? '0 16px 40px 16px' : '40px 24px 0 24px',
              marginLeft: 'auto',
              marginRight: isMobile ? 'none' : '50px',
            }}
          >
            <img
              style={{
                width: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
              width={200}
              height={200}
              alt={name}
              src={image}
            />
            {issuer && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  marginTop: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    color: '#4b5563',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: 600,
                    margin: 'auto',
                  }}
                >
                  This certification is issued by
                </div>
                <CertificateValue>
                  <a
                    style={{
                      display: 'flex',
                      margin: 'auto',
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
                        fontSize: '14px',
                      }}
                    >
                      <span>{minifyAddress(issuer)}</span>
                    </div>
                  </a>
                </CertificateValue>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <a
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
                    View contract
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
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
