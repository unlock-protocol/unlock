import fetch from 'isomorphic-fetch'
// Configuration module for accessing project settings
import config from '../config/config'

// Retrieve Gitcoin API key and Scorer ID from the configuration
const gitcoinApiKey = config.gitcoinApiKey
const gitcoinScorerId = config.gitcoinScorerId

// Interface describing the structure of a score response from Gitcoin API
interface ScoreResponse {
  address: string
  score: number
  status: string
}

// Custom error class for handling score submission errors
class ScoreSubmissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScoreSubmissionError'
  }
}

// Custom error class for handling score retrieval errors
class ScoreRetrievalError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScoreRetrievalError'
  }
}

/**
 * Submits an Ethereum address for scoring to the Gitcoin Passport API.
 * @param {string} address - The Ethereum address to submit for scoring.
 * @throws {Error} Throws an error if the Gitcoin API key is not defined.
 * @throws {ScoreSubmissionError} Throws a ScoreSubmissionError if the submission fails.
 */
export async function submitAddressForScoring(address: string): Promise<void> {
  if (!gitcoinApiKey) {
    throw new Error('Gitcoin API key is not defined.')
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': gitcoinApiKey,
  }

  const body = JSON.stringify({
    address,
    scorer_id: gitcoinScorerId,
  })

  // Perform the POST request to submit the address for scoring
  const response = await fetch(
    'https://api.scorer.gitcoin.co/registry/submit-passport',
    {
      method: 'POST',
      headers,
      body,
    }
  )

  // Await and log the raw response for debugging purposes
  const rawResponse = await response.json()

  // Handle non-200 response statuses by throwing a ScoreSubmissionError
  if (!response.ok) {
    throw new ScoreSubmissionError(
      `Failed to submit address for scoring: ${response.statusText} and ${gitcoinScorerId}`
    )
  }

  return rawResponse
}

/**
 * Retrieves scores for submitted addresses from the Gitcoin Passport API and filters them to include only the scores for the specified recipients.
 * @param {string[]} recipients An array of recipient addresses to filter the scores for.
 * @throws {Error} Throws an error if the Gitcoin API key is not defined.
 * @throws {ScoreRetrievalError} Throws a ScoreRetrievalError if fetching scores fails.
 * @returns {Promise<any>} A promise that resolves to the scores of recipients.
 */
export async function checkMultipleScores(recipients: string[]): Promise<any> {
  if (!gitcoinApiKey) {
    throw new Error('Gitcoin API key is not defined.')
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': gitcoinApiKey,
  }

  // Perform the GET request to retrieve scores
  const response = await fetch(
    `https://api.scorer.gitcoin.co/registry/score/${gitcoinScorerId}`,
    {
      method: 'GET',
      headers,
    }
  )

  // Handle non-200 response statuses by throwing a ScoreRetrievalError
  if (!response.ok) {
    throw new ScoreRetrievalError(
      `Failed to get scores: ${response.statusText}`
    )
  }

  // Parse the JSON response and simplify it to include only relevant information
  const jsonResponse = await response.json()

  const recipientScores = jsonResponse.items
    .filter((item: any) =>
      recipients.some(
        (recipient) => recipient.toLowerCase() === item.address.toLowerCase()
      )
    )
    .map((item: any) => ({
      address: item.address,
      score: parseFloat(item.score), // Ensure score is treated as a number
      status: item.status,
    }))

  // Return the simplified scores object
  return recipientScores
}

/**
 * Retrieves the score for a single Ethereum address from the Gitcoin Passport API.
 * @param {string} address - The Ethereum address whose score is to be retrieved.
 * @throws {Error} Throws an error if the Gitcoin API key is not defined.
 * @throws {ScoreRetrievalError} Throws a ScoreRetrievalError if fetching the score fails.
 * @returns {Promise<ScoreResponse>} A promise that resolves to the score response.
 */
export async function checkSingleScore(
  address: string
): Promise<ScoreResponse> {
  if (!gitcoinApiKey) {
    throw new Error('Gitcoin API key is not defined.')
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': gitcoinApiKey,
  }

  // Perform the GET request to retrieve the score for a single address
  const response = await fetch(
    `https://api.scorer.gitcoin.co/registry/score/${gitcoinScorerId}/${address}`,
    {
      method: 'GET',
      headers,
    }
  )

  // Handle non-200 response statuses by throwing a ScoreRetrievalError
  if (!response.ok) {
    throw new ScoreRetrievalError(`Failed to get score: ${response.statusText}`)
  }

  // Return the parsed JSON response as a ScoreResponse object
  return response.json() as Promise<ScoreResponse>
}
