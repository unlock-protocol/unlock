import { z } from 'zod'
import normalizer from '../../utils/normalizer'
import { Request, Response } from 'express'
import { upsertUserMetadata } from '../../operations/userMetadataOperations'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { UserMetadata } from './metadataController'
import { Rsvp } from '../../models'
import { sendEmail } from '../../operations/wedlocksOperations'
import { getEventMetadataForLock } from '../../operations/eventOperations'

const RsvpBody = z.object({
  data: z.record(z.string(), z.string()),
  recipient: z
    .string()
    .optional()
    .transform((item) => normalizer.ethereumAddress(item)),
})

export const rsvp = async (request: Request, response: Response) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const { recipient, data } = await RsvpBody.parseAsync(request.body)

  let userAddress = recipient
  // Support for walletless RSVP
  if (!recipient && data.email) {
    // We can build a recipient wallet address from the email address
    const keyManager = new KeyManager()
    userAddress = keyManager.createTransferAddress({
      params: {
        email: data.email,
        lockAddress,
      },
    })
  }

  // By default we protect all metadata
  const protectedMetadata = {
    ...data,
  }

  // Ok cool, then for each record, let's store the UserTokenMetadata
  // And then let's just add the network, lockAddress, userAddress to a new Table called RSVPs, with a state?
  const metadata = await UserMetadata.parseAsync({
    public: {},
    protected: {
      ...protectedMetadata,
    },
  })

  let rsvp = await Rsvp.findOne({
    where: {
      network,
      userAddress,
      lockAddress,
    },
  })
  if (rsvp) {
    // We do not overwrite the metadata, on purpose. First come, first serve for wallets!
    response.status(200).send(rsvp.toJSON())
    return
  }
  // Let's try to create a new RSVP
  rsvp = await Rsvp.create({
    network,
    userAddress,
    lockAddress,
    approval: 'pending',
  })

  // then save metadata
  await upsertUserMetadata({
    network,
    userAddress,
    lockAddress,
    metadata,
  })

  // Then, send email
  const eventDetail = await getEventMetadataForLock(lockAddress, network)
  sendEmail({
    network,
    template: 'eventRsvpSubmitted',
    failoverTemplate: 'eventRsvpSubmitted',
    recipient: data.email,
    params: {
      lockAddress: lockAddress,
      eventName: eventDetail?.eventName,
      eventDate: eventDetail?.eventDate,
      eventTime: eventDetail?.eventTime,
      eventUrl: eventDetail?.eventUrl || '',
    },
    attachments: [],
  })
  response.status(200).send(rsvp.toJSON())
  return
}

export const update = (approval: 'approved' | 'denied') => {
  return async (request: Request, response: Response) => {
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const userAddress = normalizer.ethereumAddress(request.params.userAddress)

    const rsvp = await Rsvp.findOne({
      where: {
        network,
        userAddress,
        lockAddress,
      },
    })
    if (!rsvp) {
      response.status(404)
      return
    }
    rsvp.approval = approval
    await rsvp.save()
    response.status(200).send(rsvp.toJSON())
    return
  }
}

const RsvpUpdateBody = z.object({
  recipients: z.array(
    z.string().transform((item) => normalizer.ethereumAddress(item))
  ),
})

export const updateBulk = (approval: 'approved' | 'denied') => {
  return async (request: Request, response: Response) => {
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const { recipients } = await RsvpUpdateBody.parseAsync(request.body)

    const [_, rsvps] = await Rsvp.update(
      {
        approval: approval,
      },
      {
        where: {
          network,
          userAddress: recipients,
          lockAddress,
        },
        returning: true,
      }
    )
    response.status(200).send({
      results: rsvps.map((rsvp) => rsvp.toJSON()),
    })
    return
  }
}
