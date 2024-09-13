import * as Base64 from '../../src/utils/base64'

import { generateTypedSignature } from '../../src/utils/signature'

const args = require('yargs').argv
const fs = require('fs')
const resolve = require('path').resolve

async function updateMetadata(
  privateKey: string,
  metadata: any,
  endpoint: string
) {
  const signature = await generateTypedSignature(privateKey, metadata)
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Base64.encode(signature)}`,
    },
    body: JSON.stringify(metadata),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

function generateUserMetadataPayload(message: any, messageKey: string) {
  return {
    types: {
      UserMetaData: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'UserMetaData',
    message: message,
    messageKey,
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
  host: string
) {
  const userAddress = '0xe29ec42F0b620b1c9A716f79A02E9DC5A5f5F98a'
  const endpoint = `${host}/api/key/${lockAddress}/user/${userAddress}`
  const contents = fs.readFileSync(resolve(inputFile), 'utf8')
  const message = JSON.parse(contents)

  const data = generateUserMetadataPayload(message, 'key')
  updateMetadata(privateKey, data, endpoint)
}

//0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229
//'/Users/akeem/projects/unlock/locksmith/scripts/data.json'
//'http://localhost:8080'

const privateKey = args.privateKey
const lockAddress = args.lockAddress
const host = args.host
const inputFile = args.inputFile

if (preflightCheck(privateKey, lockAddress, inputFile, host)) {
  main(privateKey, lockAddress, inputFile, host)
} else {
  console.log('Currently missing required data, please review input')
}
