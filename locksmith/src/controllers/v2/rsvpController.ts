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
  console.log(request.body)
  const { recipient, data, email } = await RsvpBody.parseAsync(request.body)

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

  console.log({ recipient, data, email, userAddress })

  // By default we protect all metadata
  const protectedMetadata = {
    ...data,
    email,
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
    return response.status(200).send(rsvp.toJSON())
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
  return rsvp
}
