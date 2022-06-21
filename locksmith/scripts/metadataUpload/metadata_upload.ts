import * as Base64 from '../../src/utils/base64'
import { generateTypedSignature } from '../../src/utils/signature'

const args = require('yargs').argv
const request = require('request-promise-native')
const fs = require('fs')
const resolve = require('path').resolve

async function updateMetadata(
  privateKey: string,
  metadata: any,
  endpoint: string
) {
  const signature = await generateTypedSignature(privateKey, metadata)
  const options = {
    uri: endpoint,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${Base64.encode(signature)}`,
    },
    json: metadata,
  }

  await request(options)
}

function generateLockMetadataPayload(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      LockMetadata: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'owner', type: 'string' },
        { name: 'image', type: 'string' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'LockMetadata',
    message: message,
  }
}

function generateKeyMetadataPayload(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      KeyMetadata: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'KeyMetadata',
    message: message,
  }
}

function preflightCheck(
  privateKey: string,
  lockAddress: string,
  inputFile: string,
  host: string
) {
  return privateKey && lockAddress && inputFile && host
}

async function main(
  privateKey: string,
  lockAddress: string,
  inputFile: string,
  host: string,
  scope: string
) {
  const contents = fs.readFileSync(resolve(inputFile), 'utf8')
  const message = JSON.parse(contents)

  if (scope == 'default') {
    const data = generateLockMetadataPayload(message)
    updateMetadata(privateKey, data, `${host}/api/key/${lockAddress}`)
  } else {
    const data = generateKeyMetadataPayload(message)
    updateMetadata(privateKey, data, `${host}/api/key/${lockAddress}/1`)
  }
}

//0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229
//'/Users/akeem/projects/unlock/locksmith/scripts/data.json'
//'http://localhost:8080'

const privateKey = args.privateKey
const lockAddress = args.lockAddress
const host = args.host
const inputFile = args.inputFile
const scope = args.scope

if (preflightCheck(privateKey, lockAddress, inputFile, host)) {
  main(privateKey, lockAddress, inputFile, host, scope)
} else {
  /* eslint-disable no-console */
  console.log('Currently missing required data, please review input')
}
