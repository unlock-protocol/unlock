import { z } from 'zod'
import normalizer from '../../utils/normalizer'
import { Request, Response } from 'express'
import { upsertUserMetadata } from '../../operations/userMetadataOperations'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { UserMetadata } from './metadataController'
import { Rsvp } from '../../models'
import { sendEmail } from '../../operations/wedlocksOperations'
import { getEventDataForLock } from '../../operations/eventOperations'

const RsvpBody = z.object({
  data: z.record(z.string(), z.string()),
  recipient: z
    .string()
    .optional()
    .transform((item) => normalizer.ethereumAddress(item)),
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
})

export const rsvp = async (request: Request, response: Response) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const { recipient, data, email } = await RsvpBody.parseAsync(request.body)

  // By default we protect all metadata
  const protectedMetadata = {
    ...data,
    email,
  }

  let userAddress = recipient
  // Support for walletless RSVP
  if (!recipient && email) {
    // We can build a recipient wallet address from the email address
    const keyManager = new KeyManager()
    userAddress = keyManager.createTransferAddress({
      params: {
        email,
        lockAddress,
      },
    })
  }

  // Ok cool, then for each record, let's store the UserTokenMetadata
  // And then let's just add the network, lockAddress, userAddress to a new Table called RSVPs, with a state?
  const metadata = await UserMetadata.parseAsync({
    public: {},
    protected: {
      ...protectedMetadata,
    },
  })
  await upsertUserMetadata({
    network,
    userAddress,
    lockAddress,
    metadata,
  })

  const [rsvp, created] = await Rsvp.findOrCreate({
    where: {
      network,
      userAddress,
      lockAddress,
    },
    defaults: {
      network,
      userAddress,
      lockAddress,
      approval: 'pending',
    },
  })
  if (created) {
    const eventDetail = await getEventDataForLock(lockAddress, network)
    await sendEmail({
      network,
      template: 'eventRsvpSubmitted',
      failoverTemplate: 'eventRsvpSubmitted',
      recipient: email,
      // @ts-expect-error
      params: {
        eventName: eventDetail?.eventName,
        eventDate: eventDetail?.eventDate,
        eventTime: eventDetail?.eventTime,
        eventUrl: eventDetail?.eventUrl || '',
      },
      attachments: [],
    })
  }
  return response.status(200).send(rsvp.toJSON())
}
