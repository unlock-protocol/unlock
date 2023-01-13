import config from '../config/config'
import { generateKeyMetadata } from '../operations/metadataOperations'
import { generateQrCode } from './qrcode'
import { Ticket } from '@unlock-protocol/ui'
import normalizer from './normalizer'
import ReactDom from 'react-dom/server'
import { screenshot } from './playwright'
interface Options {
  network: number
  lockAddress: string
  tokenId: string
  owner: string
  name?: string
}

export const createTicket = async ({
  network,
  lockAddress: lock,
  tokenId,
  owner,
  name,
}: Options) => {
  const lockAddress = normalizer.ethereumAddress(lock)
  const [qrCode, metadata] = await Promise.all([
    generateQrCode({
      network,
      lockAddress,
      tokenId,
      account: owner,
    }),
    generateKeyMetadata(
      lockAddress,
      tokenId,
      true,
      config.services.locksmith,
      network
    ),
  ])

  const attributes: Record<string, string>[] = metadata?.attributes || []

  const object = attributes.reduce<Record<string, string>>(
    (item, { trait_type, value }) => {
      item[trait_type] = value as string
      return item
    },
    {}
  )

  const email = metadata?.userMetadata?.protected?.email
  const imageURL: string =
    metadata?.image ||
    `${config.services.locksmith}/lock/${lockAddress}/icon?id=${tokenId}`

  const ticketHTML = ReactDom.renderToString(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ticket
        iconURL={imageURL}
        title={metadata?.name || name}
        email={email}
        id={tokenId}
        time={object?.event_start_time}
        date={object?.event_start_date}
        location={object?.event_address}
        QRCodeURL={qrCode}
        recipient={owner}
        lockAddress={lockAddress}
        network={network}
      />
    </div>
  )

  const ticket = await screenshot({
    width: 450,
    height: 1000,
    content: ticketHTML,
  })

  return ticket
}
