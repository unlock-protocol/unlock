import normalizer from './normalizer'
import config from '../config/config'
import { generateKeyMetadata } from '../operations/metadataOperations'
import { Certificate, minifyAddress } from '@unlock-protocol/ui'

import { SubgraphKey } from '@unlock-protocol/unlock-js'
import satori from 'satori'
import dayjs from 'dayjs'

import { readFileSync } from 'fs'
import { MAX_UINT } from '../../constants'
const inter400 = readFileSync('src/fonts/inter-400.woff')
const inter700 = readFileSync('src/fonts/inter-700.woff')

interface Options {
  network: number
  lockAddress: string
  tokenId: string
  key?: Omit<SubgraphKey, 'lock'>
}

/**
 * This generates a certificate using the satori library.
 */
export const createCertificate = async ({
  network,
  lockAddress: lock,
  tokenId,
  key,
}: Options) => {
  const lockAddress = normalizer.ethereumAddress(lock)
  const metadata = await generateKeyMetadata(
    lockAddress,
    tokenId,
    true,
    config.services.locksmith,
    network
  )

  const attributes: Record<string, string>[] = metadata?.attributes || []

  const object = attributes.reduce<Record<string, string>>(
    (item, { trait_type, value }) => {
      item[trait_type] = value as string
      return item
    },
    {}
  )

  const transactionHash = key?.transactionsHash?.[0]

  const expiration =
    key?.expiration && key?.expiration === MAX_UINT
      ? ''
      : dayjs.unix(key?.expiration).format('DD MMM YYYY') // example ('18 Apr 2023')

  const certificate = await satori(
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Certificate
        name={metadata?.name || ''}
        description={metadata.description}
        tokenId={metadata?.tokenId}
        owner={metadata?.owner}
        issuer={object?.certification_issuer}
        image={metadata?.image}
        lockAddress={minifyAddress(lockAddress)}
        network={network}
        transactionsHash={transactionHash ? minifyAddress(transactionHash) : ''}
        expiration={expiration}
        externalUrl={metadata?.external_url}
      />
    </div>,
    {
      width: 500,
      height: 1000,
      fonts: [
        {
          name: 'Inter',
          data: inter400,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Inter',
          data: inter700,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
  return certificate
}
