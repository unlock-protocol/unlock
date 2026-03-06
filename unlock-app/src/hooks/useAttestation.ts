// Contains all the logic of EAS attestation-related operations
//
// Main functions:
// [x] Get the data structure from the selected schema
// [x] Create an offchain attestation
// [x] Store the attestation in the locksmith db
// [] Retrieve an offchain attestation with its key

import {
  SchemaRegistry,
  EAS,
  SchemaEncoder,
  NO_EXPIRATION,
} from '@ethereum-attestation-service/eas-sdk'
import { BrowserProvider } from 'ethers'
import { networks } from '@unlock-protocol/networks'
import { baseSepolia, base } from '@unlock-protocol/networks'
import { transformDataToEas } from '~/utils/parseEasSchema'
import { locksmithClient } from '~/config/locksmith'
import { config } from '~/config/app'

// Defining the nature of the Schema object passed to the CreateOffchainAttestation function

interface Schema {
  label: string
  value: string
  description: string
  easContract: string
}

const getSchemaDataStructure = async (schemaUID: string, network: number) => {
  if (!window.ethereum) {
    throw new Error('Ethereum provider not found')
  }
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const networkConfig = networks[network]
  const schemaRegistryContractAddress = networkConfig.eas?.schemaRegistry
  if (!schemaRegistryContractAddress) {
    throw new Error('EAS not supported on this network yet')
  }

  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress)
  schemaRegistry.connect(signer as any)

  const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUID })

  return schemaRecord.schema
}

export const createOffchainAttestation = async (
  schema: Schema, // Schema object sent by the schemaOption choice
  data: any, // Data comning from the form in CreateAttestationDrawer
  lockAddress: string,
  network: number, // Placeholder for future use
  owner: string // The key holder's address (recipient of the attestation)
) => {
  // Initialize EAS with the EAS contract address ONLY ON BASE for v1
  const easConfig = baseSepolia.eas || base.eas
  if (!easConfig) {
    throw new Error('EAS config not found for this network')
  }
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const signerAddress = await signer.getAddress()

  const eas = new EAS(easConfig.contractAddress)
  eas.connect(signer as any)
  const offchain = await eas.getOffchain()

  const schemaEncoder = new SchemaEncoder(schema.value)

  const attestationData = transformDataToEas(data, schema.value)

  const encodedData = schemaEncoder.encodeData(attestationData)

  const offChainAttestation = await offchain.signOffchainAttestation(
    {
      recipient: lockAddress,
      expirationTime: NO_EXPIRATION,
      time: BigInt(Math.floor(Date.now() / 1000)),
      revocable: true,
      schema: schema.easContract,
      refUID:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      data: encodedData,
    },
    signer
  )

  // Save the attestation to locksmith database
  // Extract email from data if present (it's added by the form but not part of EAS schema)
  const { email, ...formDataWithoutEmail } = data
  await saveAttestationToLocksmith({
    lockAddress,
    network,
    tokenId: owner, // The key holder's address, not the signer (lock manager)
    schemaId: schema.easContract,
    attestationId: offChainAttestation.uid,
    data: formDataWithoutEmail,
    recipient: email || undefined, // Send certificate to this email if provided
  })

  return offChainAttestation
}

// Save attestation to locksmith database
interface SaveAttestationParams {
  lockAddress: string
  network: number
  tokenId: string
  schemaId: string
  attestationId: string
  txHash?: string
  data: Record<string, any>
  recipient?: string // Email address to send the certificate to
}

export const saveAttestationToLocksmith = async (
  params: SaveAttestationParams
) => {
  const { lockAddress, network, ...body } = params

  const response = await locksmithClient.post(
    `${config.locksmithHost}/v2/attestations/${network}/${lockAddress}`,
    body
  )
  return response.data
}

export default getSchemaDataStructure
