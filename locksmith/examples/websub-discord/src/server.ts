import { WebhookClient, MessageEmbed } from 'discord.js'
import express from 'express'
import { config } from './config'
import { chunk, NETWORK_COLOR, networks } from './util'
import { createWebsubMiddleware } from './middleware'

const port = process.env.PORT || 4000

const webhookClient = new WebhookClient(config)

const websubMiddleware = createWebsubMiddleware({
  secret: config.websubSecret,
})

const app = express()
app.use(express.json())

app.post('/callback/locks', websubMiddleware, async (req) => {
  const embeds: MessageEmbed[] = []
  const locks: any[] = req.body?.data
  const network = networks[req.body?.network]

  if (!locks.length) {
    return
  }

  for (const lock of locks) {
    const embed = new MessageEmbed()
    if (network) {
      embed.addField('network', network.name)

      const explorerURL = network.explorer.urls.address(lock.address)
      if (explorerURL) {
        embed.setURL(explorerURL)
      }
      const networkColor = NETWORK_COLOR[network.id]
      if (networkColor) {
        embed.setColor(networkColor)
      }
    }

    embed.setTitle(`New Lock (${lock.id})`)
    embeds.push(embed)
  }

  for (const embedChunks of chunk(embeds, 5)) {
    await webhookClient.send({
      embeds: embedChunks,
    })
  }
})

app.post('/callback/keys', websubMiddleware, async (req) => {
  const embeds: MessageEmbed[] = []
  const keys: any[] = req.body?.data
  const network = networks[req.body?.network]

  if (!keys.length) {
    return
  }

  for (const key of keys) {
    const embed = new MessageEmbed()
    if (network) {
      embed.addField('network', network.name)

      const explorerURL = network.explorer.urls.address(key.lock.address)
      if (explorerURL) {
        embed.setURL(explorerURL)
      }

      const networkColor = NETWORK_COLOR[network.id]
      if (networkColor) {
        embed.setColor(networkColor)
      }
    }

    embed.setTitle(`New key (${key.id})`)
    embed.addField('lock', key.lock.address)
    embeds.push(embed)
  }

  for (const embedChunks of chunk(embeds, 5)) {
    await webhookClient.send({
      embeds: embedChunks,
    })
  }
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening for websub requests on port: ${port}`)
})
