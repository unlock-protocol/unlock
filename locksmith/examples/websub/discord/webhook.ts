import { WebhookClient, MessageEmbed } from 'discord.js'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { config } from './config'
import { chunk } from './util'
import { createSignature } from '../../../src/websub/helpers'


const webhookClient = new WebhookClient(config)

const port = process.env.PORT || 4040

const app = express()
app.use(express.json())

const websubMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body?.hub?.challenge) {
    res.json(req.body)
  } else {
    if (req.headers['x-hub-signature']) {
      const signHeader = req.headers['x-hub-signature'] as string
      const [algorithm, signature] = signHeader.split('=')
      const computedSignature = createSignature({
        content: JSON.stringify(req.body),
        secret: config.signKey,
        algorithm,
      })
      if (computedSignature === signature) {
        next()
      } else {
        return
      }
    }
    next()
  }
}

app.post('/callback/locks', websubMiddleware, async (req) => {
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

  // Sequential update of 5 lock embeds per message if there are too many.
  for (const ems of chunk(embeds, 5)) {
    await webhookClient.send({
      embeds: ems,
    })
  }
})

app.post('/callback/keys', websubMiddleware, async (req) => {
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

  // Sequential update of 5 key embeds per message if there are too many.
  for (const ems of chunk(embeds, 5)) {
    await webhookClient.send({
      embeds: ems,
    })
  }
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Listening for websub requests on port 4000')
})
