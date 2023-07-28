import { ReactNode } from 'react'
import { networks } from '@unlock-protocol/networks'
import { minifyAddress } from '~/utils'

export interface Props {
  id: string
  recipient: string
  title: string
  iconURL: string
  location?: string
  time?: string
  date?: string
  lockAddress: string
  network: number
  QRCodeURL: string
  email?: string
}

export function Ticket({
  iconURL,
  title,
  recipient,
  id,
  QRCodeURL,
  date,
  time,
  location,
  lockAddress,
  network,
  email,
}: Props) {
  const networkConfig = networks[network]
  return (
    <div
      style={{
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        maxWidth: '450px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          width: '100%',
          borderRadius: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '24px 0',
          }}
        >
          <img
            width={64}
            height={64}
            style={{
              borderRadius: '6px',
            }}
            src={iconURL}
            alt={title}
          />
          <div
            style={{
              lineHeight: '34px',
              fontSize: '24px',
              paddingLeft: '24px',
              fontWeight: 700,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {date && (
            <TicketItem
              icon={
                <svg
                  style={{
                    width: '24px',
                    height: '24px',
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M17 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z" />
                  </g>
                </svg>
              }
              value={date}
            />
          )}
          {time && (
            <TicketItem
              icon={
                <svg
                  style={{
                    width: '24px',
                    height: '24px',
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm3.536-12.95l1.414 1.414-4.95 4.95L10.586 12l4.95-4.95z" />
                  </g>
                </svg>
              }
              value={time}
            />
          )}
          {location && (
            <TicketItem
              icon={
                <svg
                  style={{
                    width: '24px',
                    height: '24px',
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
                  </g>
                </svg>
              }
              value={location}
            />
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyItems: 'center',
          alignItems: 'center',
          width: '100%',
          borderRadius: '24px',
          padding: '12px',
          borderTop: '2px dashed #e5e7eb',
        }}
      >
        <img src={QRCodeURL} width={400} height={400} alt="qrcode" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
            marginTop: '6px',
            fontSize: '12px',
            lineHeight: '16px',
          }}
        >
          Powered by Unlock Protocol
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          padding: '24px',
          borderTop: '2px dashed #e5e7eb',
        }}
      >
        {email && (
          <TicketItem
            icon={
              <svg
                style={{
                  width: '24px',
                  height: '24px',
                }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g>
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M17 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z" />
                </g>
              </svg>
            }
            value={email}
          />
        )}
        <div
          style={{
            display: 'flex',
            marginBottom: '12px',
            marginTop: '12px',
          }}
        >
          <TicketLabel label="Network" value={networkConfig.name} />
          <TicketLabel
            label="Lock Address"
            value={minifyAddress(lockAddress)}
          />
        </div>
        <div
          style={{
            display: 'flex',
          }}
        >
          <TicketLabel label="Token ID" value={id} />
          <TicketLabel label="Recipient" value={minifyAddress(recipient)} />
        </div>
      </div>
    </div>
  )
}

interface TicketLabelProps {
  label: string
  value: string
}

export function TicketLabel({ label, value }: TicketLabelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '50%',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          lineHeight: '20px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '18px',
          lineHeight: '28px',
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export interface TicketItemProps {
  icon: ReactNode
  value: string
}

export function TicketItem({ icon, value }: TicketItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
      }}
    >
      {icon}
      <div
        style={{
          marginLeft: '16px',
          fontWeight: 700,
          fontSize: '18px',
        }}
      >
        {value}
      </div>
    </div>
  )
}
