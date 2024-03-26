import { RequestHandler } from 'express'
import { guild } from '@guildxyz/sdk'
import * as z from 'zod'
import normalizer from '../../utils/normalizer'
import { getSettings } from '../../operations/lockSettingOperations'
import { ethers } from 'ethers'
import { getSignerFromOnKeyPurchaserHookOnLock } from '../../fulfillment/dispatcher'
import {
  checkMultipleScores,
  submitAddressForScoring,
} from '../../operations/gitcoinVerification'

const guildHookQuery = z.object({
  network: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number()),
  lockAddress: z.string(),
  recipients: z
    .preprocess((a) => {
      if (typeof a === 'string') return [a]
      return a
    }, z.array(z.string()))
    .transform((item) => item.map((item) => normalizer.ethereumAddress(item))),
})

// This is the hook that is called to verify that a user is part of tha guild
// First we get the lock's hook, we query the hook to get the signer
// we get its signature
export const guildHook: RequestHandler = async (request, response) => {
  const { network, recipients, lockAddress } = await guildHookQuery.parseAsync(
    request.query
  )
  const settings = await getSettings({
    lockAddress,
    network,
  })
  if (!settings?.hookGuildId) {
    return response.status(401)
  }
  const hookGuildId = settings.hookGuildId

  const wallet = await getSignerFromOnKeyPurchaserHookOnLock({
    lockAddress,
    network,
  })

  if (!wallet) {
    return response.status(422).json({
      error: 'This lock has a misconfigured Guild hook.',
    })
  }

  const accesses = await Promise.all(
    recipients.map(async (recipient: string) => {
      const roles = await guild.getUserAccess(hookGuildId, recipient)
      const hasAtLeastOne = roles.some((role) => role.access)
      if (!hasAtLeastOne) {
        return ''
      }
      const message = recipient.toLowerCase()
      const messageHash = ethers.utils.solidityKeccak256(['string'], [message])
      return wallet.signMessage(ethers.utils.arrayify(messageHash))
    })
  )
  return response.status(200).send({
    result: accesses,
  })
}

// schema for validating and parsing incoming request queries using Zod
const gitcoinHookQuery = z.object({
  network: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number()),
  lockAddress: z.string(),
  recipients: z
    .preprocess((a) => {
      // preprocess to ensure recipients is always an array of strings
      if (typeof a === 'string') return [a]
      return a
    }, z.array(z.string()))
    // transform each recipient address using a normalization function
    .transform((items) =>
      items.map((item) => normalizer.ethereumAddress(item))
    ),
})

/**
 * The `gitcoinHook` function is designed to handle the scoring and verification process for recipients (typically wallet addresses)
 * submitted through a request. This process involves several key steps:
 * 1. Parsing and validating the input parameters from the request, including network details, recipient addresses, and lock address.
 * 2. Submitting each recipient's address for scoring, initiating an asynchronous process that calculates their respective scores
 *    based on predefined criteria (via `submitAddressForScoring`).
 * 3. Retrieving a wallet that is capable of signing messages, which is necessary for generating cryptographic signatures as a form of
 *    verification for recipients with scores above a certain threshold.
 * 4. Fetching the scores for all submitted recipients, utilizing a batch or collective approach for efficiency.
 * 5. Evaluating each recipient's score to determine if it exceeds the defined threshold (in this case, a score greater than 20).
 *    Recipients with qualifying scores are then provided with a signature generated using the retrieved wallet, serving as a form
 *    of validation or access granting. Recipients not meeting the score requirement receive an empty string, indicating a lack of
 *    qualification.
 * 6. Compiling and responding with the results, which include either signatures for qualified recipients or empty strings for
 *    those who did not qualify, effectively communicating the outcome of the verification process.
 *

 */
export const gitcoinHook: RequestHandler = async (request, response) => {
  const { network, recipients, lockAddress } =
    await gitcoinHookQuery.parseAsync(request.query)

  try {
    // submit each recipient for scoring
    await Promise.all(
      recipients.map((recipient) => submitAddressForScoring(recipient))
    )

    // retrieve the wallet for signing, ensuring it's available before generating signatures
    const wallet = await getSignerFromOnKeyPurchaserHookOnLock({
      lockAddress,
      network,
    })

    if (!wallet) {
      return response.status(422).json({
        error: 'This lock has a misconfigured Gitcoin Passport hook.',
      })
    }

    // here, we wait for 3 seconds after submission, as the scores are being processed
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // retrieve scores for all submitted recipients
    const scoresResponse = await checkMultipleScores(recipients)

    // generate signatures for recipients with valid scores
    const generatedSignatures = scoresResponse.map((recipient: any) => {
      // only sign recipients who have a score greater than or equal to 20
      if (recipient && recipient.score >= 20) {
        const message = recipient.toLowerCase()
        const messageHash = ethers.utils.solidityKeccak256(
          ['string'],
          [message]
        )
        const signature = wallet.signMessage(ethers.utils.arrayify(messageHash))
        return signature
      } else {
        return ''
      }
    })

    // wait for all signatures to be generated
    const signatures = await Promise.all(generatedSignatures)

    // send the signatures
    return response.status(200).send({
      result: signatures,
    })
  } catch (error) {
    // log and send errors if encountered
    console.error('Error in Gitcoin score verification:', error)
    return response
      .status(500)
      .json({ error: 'Error verifying Gitcoin scores.' })
  }
}
