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
import { transformDataToEas } from '~/utils/parseEasSchema'
import { locksmithClient } from '~/config/locksmith'
import { config } from '~/config/app'

// EAS predeploy addresses (same on all OP Stack chains including Base Sepolia)
const EAS_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000021'
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020'

// Defining the nature of the Schema object passed to the CreateOffchainAttestation function

interface Schema {
  label: string
  value: string
  description: string
  easContract: string
}

const getSchemaDataStructure = async (schemaUID: string) => {
  if (!window.ethereum) {
    throw new Error('Ethereum provider not found')
  }
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS)
  schemaRegistry.connect(signer as any)

  const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUID })

  return schemaRecord.schema
}

export const createOffchainAttestation = async (
  schema: Schema, // Schema object sent by the schemaOption choice
  data: any, // Data coming from the form in CreateAttestationDrawer
  lockAddress: string,
  network: number,
  owner: string // The key holder's address (recipient of the attestation)
) => {
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const eas = new EAS(EAS_CONTRACT_ADDRESS)
  eas.connect(signer as any)
  const offchain = await eas.getOffchain()

  const schemaEncoder = new SchemaEncoder(schema.value)

  const attestationData = transformDataToEas(data, schema.value)

  const encodedData = schemaEncoder.encodeData(attestationData)

  const offChainAttestation = await offchain.signOffchainAttestation(
    {
      recipient: owner,
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
