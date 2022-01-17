import { WebhookClient, MessageEmbed } from 'discord.js'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { config } from './config'

const webhookClient = new WebhookClient(config)

const app = express()
app.use(express.json())

const websubMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body?.hub?.mode === 'subscribe' && req.body?.hub?.challenge) {
    res.json(req.body)
  } else {
    next()
  }
}

app.post('/callback/locks', websubMiddleware, (req) => {
  const embeds: MessageEmbed[] = []
  const locks: any[] = req.body?.data
  if (!locks.length) {
    return
  }
  for (const lock of locks) {
    const embed = new MessageEmbed()
    embed.setTitle('New Lock')
    embed.addField('Lock ID', lock.id)
    embeds.push(embed)
  }

  webhookClient.send({
    embeds: embeds,
  })
})

app.post('/callback/keys', websubMiddleware, (req) => {
  const embeds: MessageEmbed[] = []
  const keys: any[] = req.body?.data
  if (!keys.length) {
    return
  }

  for (const key of keys) {
    const embed = new MessageEmbed()
    embed.setTitle('New Key')
    embed.addField('Key Id', key.id)
    embeds.push(embed)
  }

  webhookClient.send({
    embeds: embeds,
  })
})

app.listen(4040, () => {
  // eslint-disable-next-line no-console
  console.log('Listening for websub requests on port 4000')
})
