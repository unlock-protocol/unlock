import normalizer from './normalizer'
import config from '../config/config'
import * as metadataOperations from '../operations/metadataOperations'
import { Certificate, minifyAddress } from '@unlock-protocol/ui'
import { SubgraphKey } from '@unlock-protocol/unlock-js'
import satori from 'satori'
import dayjs from 'dayjs'

import { readFileSync } from 'fs'
import { networks } from '@unlock-protocol/networks'
import { generateKeyMetadata } from '../operations/metadataOperations'
import { ethers } from 'ethers'
import { imageUrlToBase64 } from './image'
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

  const [lockData, metadata] = await Promise.all([
    metadataOperations.getLockMetadata({
      lockAddress,
      network,
    }),
    generateKeyMetadata(
      lockAddress,
      tokenId,
      true,
      config.services.locksmith,
      network
    ),
  ])

  const attributes: Record<string, string>[] = lockData?.attributes || []

  const object = attributes.reduce<Record<string, string>>(
    (item, { trait_type, value }) => {
      item[trait_type] = value as string
      return item
    },
    {}
  )

  const transactionHash = key?.transactionsHash?.[0] ?? ''

  const expiration =
    key?.expiration &&
    key?.expiration === ethers.constants.MaxUint256.toString()
      ? ''
      : dayjs.unix(key?.expiration).format('DD MMM YYYY') // example ('18 Apr 2023')

  const imageBase64 = await imageUrlToBase64(metadata?.image, lockAddress)

  const certificate = await satori(
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <Certificate
        name={metadata?.name || ''}
        description={metadata.description}
        tokenId={metadata?.tokenId}
        owner={metadata?.owner}
        issuer={object?.certification_issuer}
        image={imageBase64}
        lockAddress={minifyAddress(lockAddress)}
        network={network}
        networkName={networks[network]?.name}
        // can't use minifyAddress because is checking if the address is valid
        transactionsHash={`${transactionHash.slice(
          0,
          5
        )}...${transactionHash.slice(transactionHash.length - 5)}`}
        expiration={expiration}
        externalUrl={metadata?.external_url}
      />
    </div>,
    {
      width: 1200,
      height: 600,
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
  console.log('certificate', certificate)
  return certificate
}
