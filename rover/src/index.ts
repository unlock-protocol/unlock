#!/usr/bin/env node

import { config } from 'dotenv'
import { ethers } from 'ethers'
import { createConnection } from 'typeorm'
import RoverEmitter from './roverEmitter'
import { Storage } from './storage'
import transaction from './handler/transaction'
import { blockHandler } from './handler/block'
import * as path from 'path'

async function main(provider, emitter, configuration) {
  let connection = await createConnection(configuration)
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

config({ path: path.resolve(process.cwd(), '.env') })
let configuration = require('../config/config')

let emitter = new RoverEmitter()
let provider = new ethers.providers.JsonRpcProvider(configuration.provider_uri)
main(provider, emitter, configuration)
