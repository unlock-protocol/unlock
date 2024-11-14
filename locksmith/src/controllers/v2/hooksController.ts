import { RequestHandler } from 'express'
import * as z from 'zod'
import normalizer from '../../utils/normalizer'
import { getSettings } from '../../operations/lockSettingOperations'
import { ethers } from 'ethers'
import { getSignerFromOnKeyPurchaserHookOnLock } from '../../fulfillment/dispatcher'
import {
  checkMultipleScores,
  submitAddressForScoring,
} from '../../operations/gitcoinVerification'
import logger from '../../logger'
import guildClient from '../../config/guild'

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
    response.status(401)
    return
  }

  const hookGuildId = settings.hookGuildId

  const wallet = await getSignerFromOnKeyPurchaserHookOnLock({
    lockAddress,
    network,
  })

  if (!wallet) {
    response.status(422).json({
      error: 'This lock has a misconfigured Guild hook.',
    })
    return
  }

  const accesses = await Promise.all(
    recipients.map(async (recipient: string) => {
      const { user: userClient } = guildClient
      const userMemberships = await userClient.getMemberships(recipient)
      const hasAtLeastOne = userMemberships.some(
        (role) => role.guildId === hookGuildId
      )
      if (!hasAtLeastOne) {
        return ''
      }
      const message = recipient.toLowerCase()
      const messageHash = ethers.solidityPackedKeccak256(['string'], [message])
      return wallet.signMessage(ethers.getBytes(messageHash))
    })
  )

  response.status(200).send({
    result: accesses,
  })
  return
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

// polling mechanism parameters
const pollingConfig = {
  // maximum number of attempts before "giving up"
  maxAttempts: 5,
  // initial delay in milliseconds before the first retry is attempted
  initialDelay: 3500,
  // factor by which to multiply the delay between retries
  backoffFactor: 2,
}

export const gitcoinHook: RequestHandler = async (request, response) => {
  const { network, recipients, lockAddress } =
    await gitcoinHookQuery.parseAsync(request.query)

  // retrieve the required Gitcoin Passport score for the lock
  const settings = await getSettings({
    lockAddress,
    network,
  })

  // ensure that requiredGitcoinPassportScore is defined
  if (
    !settings?.requiredGitcoinPassportScore ||
    settings?.requiredGitcoinPassportScore === null
  ) {
    // if the check fails, respond with an appropriate error message
    response.status(400).json({
      error: 'The required Gitcoin Passport score is not defined or invalid.',
    })
    return
  }

  const requiredScore = settings.requiredGitcoinPassportScore

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
      response.status(422).json({
        error: 'This lock has a misconfigured Gitcoin Passport hook.',
      })
      return
    }

    let attempts = 0
    let scoresReady = false
    let delay = pollingConfig.initialDelay
    let scoresResponse

    while (attempts < pollingConfig.maxAttempts && !scoresReady) {
      try {
        scoresResponse = await checkMultipleScores(recipients)
        scoresReady = true
      } catch (error) {
        logger.error(error)
        attempts++
        await new Promise((resolve) => setTimeout(resolve, delay))
        // Apply backoff factor to delay between retries
        delay *= pollingConfig.backoffFactor
      }
    }

    if (!scoresReady) {
      response.status(504).json({
        error: 'Timeout: Unable to verify scores within expected time frame.',
      })
      return
    }

    // generate signatures for recipients with valid scores
    const generatedSignatures = scoresResponse.map(async (recipient: any) => {
      // only sign recipients who have a score that meets the specified threshold in the lock settings
      if (recipient && recipient.score >= requiredScore) {
        const message = recipient.address.toLowerCase()
        const messageHash = ethers.solidityPackedKeccak256(
          ['string'],
          [message]
        )
        const signature = await wallet.signMessage(ethers.getBytes(messageHash))
        return signature
      } else {
        return ''
      }
    })

    // wait for all signatures to be generated
    const signatures = await Promise.all(generatedSignatures)

    // send the signatures
    response.status(200).send({
      result: signatures,
    })
    return
  } catch (error) {
    // log and send errors if encountered
    logger.error('Error in Gitcoin score verification:', error)
    response.status(500).json({ error: 'Error verifying Gitcoin scores.' })
    return
  }
}
