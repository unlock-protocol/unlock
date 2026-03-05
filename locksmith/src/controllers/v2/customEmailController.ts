import { Request, RequestHandler, Response } from 'express'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import { CustomEmailContent } from '../../models/customEmailContent'
import * as emailOperations from '../../operations/emailOperations'
import { addJob } from '../../worker/worker'
import { getEventBySlug } from '../../operations/eventOperations'
import { sendEmail } from '../../operations/wedlocksOperations'
import { getEventUrl } from '../../utils/eventHelpers'

const CustomEmail = z.object({
  content: z
    .string({
      description: 'Custom content of the email',
    })
    .optional()
    .default(''),
})

export const saveCustomContent = async (
  request: Request,
  response: Response
) => {
  try {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const template = request.params.template?.toUpperCase()

    const { content } = await CustomEmail.parseAsync(request.body)

    const [customEmail] = await CustomEmailContent.upsert(
      {
        lockAddress,
        network,
        content,
        template,
      },
      {
        returning: true,
        conflictFields: ['lockAddress', 'network', 'template'],
      }
    )
    response.status(200).send(customEmail)
    return
  } catch (err: any) {
    logger.error(err.message)
    response.status(500).send({
      message: 'Could not save custom email content.',
    })
    return
  }
}

export const getCustomContent = async (
  request: Request,
  response: Response
) => {
  try {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const template = request.params.template?.toUpperCase()

    const customEmail = await emailOperations.getCustomTemplateContent({
      lockAddress,
      network,
      template,
    })

    if (customEmail) {
      response.status(200).send(customEmail)
      return
    }
    response.status(404).json({
      message: 'Custom email content not found for this template.',
    })
    return
  } catch (err: any) {
    logger.error(err.message)
    response.status(500).send({
      message: 'Could not get custom email content.',
    })
    return
  }
}

const SendCustomEmailBody = z.object({
  content: z.string(),
  subject: z.string(),
})

export const sendCustomEmail: RequestHandler = async (request, response) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)

  const parsed = await SendCustomEmailBody.parseAsync(request.body)

  if (!(lockAddress && network)) {
    response.status(400).send({
      message: 'Invalid lock address or network',
    })
    return
  }

  await addJob(
    'sendToAllJob',
    {
      lockAddress,
      network,
      ...parsed,
    },
    {
      maxAttempts: 3,
    }
  )

  response.status(200).send({
    success: true,
  })
  return
}

export const EventInviteBody = z.object({
  recipients: z.array(z.string().email()).max(10),
})

export const sendEventInvite: RequestHandler = async (request, response) => {
  const slug = request.params.slug.toLowerCase().trim()
  const event = await getEventBySlug(slug, true)

  const { recipients } = await EventInviteBody.parseAsync(request.body)
  const results = await Promise.all(
    recipients.map(
      async (recipient) =>
        await sendEmail({
          template: 'inviteEvent',
          recipient,
          emailSender: event!.data.emailSender,
          replyTo: event!.data.replyTo,
          params: {
            eventName: event!.name,
            eventDate: event!.data.ticket.event_start_date,
            eventTime: event!.data.ticket.event_start_time,
            eventUrl: getEventUrl(event!),
          },
          attachments: [],
        })
    )
  )

  response.send(results).status(200)
  return
}
