import { Web3Service } from '@unlock-protocol/unlock-js'
import { z } from 'zod'
import normalizer from '../../utils/normalizer'
import networks from '@unlock-protocol/networks'
import { Request, Response } from 'express'
import {
  addMetadata,
  upsertUserMetadata,
} from '../../operations/userMetadataOperations'
import { KeyManager, Web3Service } from '@unlock-protocol/unlock-js'
import { UserMetadata } from './metadataController'
import { Rsvp } from '../../models'

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
  return response.status(200).send(rsvp.toJSON())
}
