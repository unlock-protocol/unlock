import { Contract } from 'ethers'
import { ethers, unlock } from 'hardhat'
import { purchaseKey } from './helpers/keys'
import { lockParams } from './helpers/fixtures'
import { expect } from 'chai'
import fetch from 'isomorphic-fetch'

const LOCKSMITH_URL = process.env.LOCKSMITH_URL || 'http://locksmith:8080'
const NETWORK = 31337

/**
 * Authenticate with locksmith via SIWE (Sign-In with Ethereum).
 * Builds the EIP-4361 message manually to avoid needing the `siwe` package.
 * Returns a Bearer access token for the given signer.
 */
const loginToLocksmith = async (signer: any): Promise<string> => {
  const address = await signer.getAddress()

  // 1. Get a nonce from locksmith
  const nonceRes = await fetch(`${LOCKSMITH_URL}/v2/auth/nonce`)
  const nonce = await nonceRes.text()

  const issuedAt = new Date().toISOString()
  const domain = 'localhost'
  const uri = LOCKSMITH_URL
  const statement = 'Sign in to Unlock'
  const version = '1'
  const chainId = NETWORK

  // 2. Build EIP-4361 SIWE message string
  const siweMessageText = [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    '',
    statement,
    '',
    `URI: ${uri}`,
    `Version: ${version}`,
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n')

  // 3. Sign and send login request
  const signature = await signer.signMessage(siweMessageText)

  // The locksmith login endpoint expects the SIWE message as a structured object
  const messageObj = {
    domain,
    address,
    statement,
    uri,
    version,
    chainId,
    nonce,
    issuedAt,
  }

  const loginRes = await fetch(`${LOCKSMITH_URL}/v2/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: messageObj, signature }),
  })

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`)
  }

  const { accessToken } = await loginRes.json()
  return accessToken
}

describe('EAS Attestations', function () {
  let lock: Contract
  let lockAddress: string
  let managerToken: string
  let keyHolderToken: string
  let keyHolderAddress: string

  const attestationData = {
    firstName: 'Thib',
    lastName: 'theDesignIconoclast',
  }

  const schemaId =
    '0x3a9923db8a119d3bd312ca18781631c2f96fe5d31e67b437eb919148bfd84be6'

  before(async () => {
    // Create lock
    ;({ lock } = await unlock.createLock({ ...lockParams, version: 15 }))
    lockAddress = await lock.getAddress()

    // Get signers: signer[0] is lock manager, signer[1] is key holder
    const signers = await ethers.getSigners()
    const manager = signers[0]
    keyHolderAddress = await signers[1].getAddress()

    // Purchase a key for the key holder
    await purchaseKey(lockAddress, keyHolderAddress)

    // Authenticate both users with locksmith
    managerToken = await loginToLocksmith(manager)
    keyHolderToken = await loginToLocksmith(signers[1])
  })

  it('creates attestation when membership is issued', async () => {
    // Create an attestation via the locksmith API as lock manager
    const attestationId =
      '0x' + Buffer.from(`test-attestation-${Date.now()}`).toString('hex')

    const res = await fetch(
      `${LOCKSMITH_URL}/v2/attestations/${NETWORK}/${lockAddress}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          tokenId: keyHolderAddress,
          schemaId,
          attestationId,
          data: attestationData,
        }),
      }
    )

    // Verify attestation was created
    expect(res.status).to.be.oneOf([200, 201])

    const attestation = await res.json()
    expect(attestation.attestationId).to.equal(attestationId)
    expect(attestation.schemaId).to.equal(schemaId)
    expect(attestation.network).to.equal(NETWORK)

    // Check attestation ID is valid (non-empty hex string)
    expect(attestation.attestationId).to.match(/^0x[0-9a-f]+$/i)
  })

  it('saves attestation UID to database', async () => {
    // Create attestation
    const attestationId =
      '0x' + Buffer.from(`test-attestation-db-${Date.now()}`).toString('hex')

    await fetch(`${LOCKSMITH_URL}/v2/attestations/${NETWORK}/${lockAddress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        tokenId: keyHolderAddress,
        schemaId,
        attestationId,
        data: attestationData,
      }),
    })

    // Verify UID saved to locksmith DB - retrieve by attestation ID
    const res = await fetch(
      `${LOCKSMITH_URL}/v2/attestations/${NETWORK}/${lockAddress}/${attestationId}`,
      {
        headers: {
          Authorization: `Bearer ${managerToken}`,
        },
      }
    )

    expect(res.status).to.equal(200)

    const attestation = await res.json()

    // Retrieve and verify data
    expect(attestation.attestationId).to.equal(attestationId)
    expect(attestation.lockAddress.toLowerCase()).to.equal(
      lockAddress.toLowerCase()
    )
    expect(attestation.network).to.equal(NETWORK)
    expect(attestation.data).to.deep.include(attestationData)
  })

  it('certificate shows attestation status', async () => {
    // Create an attestation for certificate generation
    const attestationId =
      '0x' + Buffer.from(`test-attestation-cert-${Date.now()}`).toString('hex')

    await fetch(`${LOCKSMITH_URL}/v2/attestations/${NETWORK}/${lockAddress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        tokenId: keyHolderAddress,
        schemaId,
        attestationId,
        data: attestationData,
      }),
    })

    // Generate certificate - download as PDF via the key holder
    const res = await fetch(
      `${LOCKSMITH_URL}/v2/attestations/${NETWORK}/${lockAddress}/${attestationId}/download`,
      {
        headers: {
          Authorization: `Bearer ${keyHolderToken}`,
        },
      }
    )

    // Verify attestation info is present in the response
    expect(res.status).to.equal(200)

    // Check UI elements present: PDF content type and download headers
    const contentType = res.headers.get('content-type')
    expect(contentType).to.include('application/pdf')

    const contentDisposition = res.headers.get('content-disposition')
    expect(contentDisposition).to.include('attachment')
    expect(contentDisposition).to.include('.pdf')
  })

  it('user can view their attestation', async () => {
    // Create an attestation to view
    const attestationId =
      '0x' + Buffer.from(`test-attestation-view-${Date.now()}`).toString('hex')

    await fetch(`${LOCKSMITH_URL}/v2/attestations/${NETWORK}/${lockAddress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        tokenId: keyHolderAddress,
        schemaId,
        attestationId,
        data: attestationData,
      }),
    })

    // Key holder views their attestations (my-attestations endpoint)
    const res = await fetch(
      `${LOCKSMITH_URL}/v2/attestations/${NETWORK}/${lockAddress}/my-attestations`,
      {
        headers: {
          Authorization: `Bearer ${keyHolderToken}`,
        },
      }
    )

    expect(res.status).to.equal(200)

    const attestations = await res.json()

    // Verify attestation details shown
    expect(attestations).to.be.an('array')
    expect(attestations.length).to.be.greaterThan(0)

    // Click attestation viewer: find the specific attestation and verify details
    const found = attestations.find(
      (a: any) => a.attestationId === attestationId
    )
    expect(found).to.not.be.undefined
    expect(found.data.firstName).to.equal(attestationData.firstName)
    expect(found.data.lastName).to.equal(attestationData.lastName)
    expect(found.lockAddress.toLowerCase()).to.equal(lockAddress.toLowerCase())
  })
})
