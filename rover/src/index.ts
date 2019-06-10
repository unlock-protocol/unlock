#!/usr/bin/env node

import { ethers } from 'ethers'
import { createConnection } from 'typeorm'
import RoverEmitter from './roverEmitter'
import { Storage } from './storage'
import transaction from './handler/transaction'
import { blockHandler } from './handler/block'
const config = require('../config/config')

async function main(provider, emitter) {
  let connection = await createConnection(config)
  let storage = new Storage(connection.manager)

  provider.on('block', async blockNumber => {
    blockHandler(storage, blockNumber, emitter, provider)
  })

  emitter.on('transaction', async transactionHash => {
    transaction.transactionHandler(
      storage,
      connection,
      transactionHash,
      provider
    )
  })

  emitter.on('registration', () => {})
}

let emitter = new RoverEmitter()
let provider = new ethers.providers.JsonRpcProvider(config.provider_uri)

main(provider, emitter)
