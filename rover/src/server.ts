#!/usr/bin/env node

import { config } from 'dotenv'
import { ethers } from 'ethers'
import { createConnection } from 'typeorm'
import RoverEmitter from './roverEmitter'
import { Storage } from './storage'
import transaction from './handler/transaction'
import { blockHandler } from './handler/block'
import * as path from 'path'

import Backfiller from './backfill'

const express = require('express')
const app = express()

async function main(provider, emitter, configuration) {
  let connection = await createConnection(configuration)
  let storage = new Storage(connection.manager)
  let backfill = new Backfiller(configuration.network, emitter)

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

  emitter.on('registration', registree => {
    backfill.backfill(registree)
  })
}

config({ path: path.resolve(process.cwd(), '.env') })
let configuration = require('../config/config')

let emitter = new RoverEmitter()
let provider = new ethers.providers.JsonRpcProvider(configuration.provider_uri)
main(provider, emitter, configuration)

const port = configuration.serverPort

createConnection(configuration).then(async connection => {
  let storage = new Storage(connection.manager)
  app.post('/register/:registree', (req, res) => {
    let registree = req.params.registree
    storage.storeRegistree({
      address: registree,
    })
    emitter.emit('registration', registree)
    res.sendStatus(200)
  })

  app.listen(port, () => console.log(`Rover is up`))
})
