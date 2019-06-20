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
import { Registry } from './registry'

const express = require('express')
const app = express()
config({ path: path.resolve(process.cwd(), '.env') })
let configuration = require('../config/config')
let emitter = new RoverEmitter()
let provider = new ethers.providers.JsonRpcProvider(configuration.provider_uri)
const port = configuration.serverPort

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

  emitter.on('registration', async registree => {
    backfill.backfill(registree)
  })
}

async function registration(registry, storage, entry){
  if (!registry.includes(entry)) {
    await storage.storeRegistree({
      address: entry,
    })

    emitter.emit('registration', entry)
  }

}

main(provider, emitter, configuration)

createConnection(configuration).then(async connection => {
  let storage = new Storage(connection.manager)

  app.post('/register/:registree', async (req, res) => {
    let registree = req.params.registree
    let registry = await Registry.get(connection)

    await registration(registry, storage, registree)
    res.sendStatus(200)
  })

  app.listen(port, () => console.log(`Rover is up`))
})
