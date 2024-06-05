import { Request, Response } from 'express'
import StripeOperations from '../operations/stripeOperations'
import * as Normalizer from '../utils/normalizer'
import UserOperations from '../operations/userOperations'
import logger from '../logger'
import { ethers } from 'ethers'
import { MemoryCache } from 'memory-cache-node'
import { issueUserToken } from '@coinbase/waas-server-auth'
import config from '../config/config'
import { OAuth2Client } from 'google-auth-library'

// Decoy users are cached for 15 minutes
const cacheDuration = 60 * 15
const decoyUserCache = new MemoryCache<string, any>(cacheDuration / 5, 1000)

export const enum UserAccountType {
  UnlockAccount = 'UNLOCK_ACCOUNT',
  GoogleAccount = 'GOOGLE_ACCOUNT',
  PasskeyAccount = 'PASSKEY_ACCOUNT',
  EmailCodeAccount = 'EMAIL_CODE',
  None = 'NONE',
}

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { user } = req.body.message

    if (user) {
      const { emailAddress } = user
      const ejected = await UserOperations.ejectionStatus(emailAddress)

      if (ejected) {
        return res.sendStatus(409)
      }
      const creationStatus = await userCreationStatus(user)
      const { recoveryPhrase } = creationStatus

      return res.status(creationStatus.status).json({ recoveryPhrase })
    }
    return res.sendStatus(400)
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json(error.errors)
    } else {
      logger.error('Failed to create user', error)
      return res.sendStatus(400)
    }
  }
}

const userCreationStatus = async (user: any): Promise<any> => {
  const recoveryPhrase: string | undefined = await UserOperations.createUser({
    emailAddress: user.emailAddress,
    publicKey: user.publicKey,
    passwordEncryptedPrivateKey: user.passwordEncryptedPrivateKey,
  })

  const status = recoveryPhrase ? 200 : 400
  return { status, recoveryPhrase }
}

export const retrieveEncryptedPrivatekey = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { emailAddress } = req.params
  const ejected = await UserOperations.ejectionStatus(emailAddress)

  if (ejected) {
    return res.sendStatus(404)
  }

  const result =
    await UserOperations.getUserPrivateKeyByEmailAddress(emailAddress)

  if (result) {
    return res.json({ passwordEncryptedPrivateKey: result })
  } else {
    let passwordEncryptedPrivateKey =
      decoyUserCache.retrieveItemValue(emailAddress)
    if (!passwordEncryptedPrivateKey) {
      passwordEncryptedPrivateKey = await ethers.Wallet.createRandom().encrypt(
        (Math.random() + 1).toString(36),
        {
          scrypt: {
            // web3 used 1 << 5, ethers default is 1 << 18. We want speedy encryption here since this is not a real account anyway.
            // eslint-disable-next-line no-bitwise
            N: 1 << 5,
          },
        }
      )
      decoyUserCache.storeExpiringItem(
        emailAddress,
        passwordEncryptedPrivateKey,
        cacheDuration
      )
    }

    return res.json({
      passwordEncryptedPrivateKey,
    })
  }
}

const verifyToken = async (email: string, token: string) => {
  const client = new OAuth2Client()
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.googleAuthClientId,
  })

  const payload = ticket.getPayload()

  if (payload?.email === email) {
    return true
  }

  return false
}

export const retrieveWaasUuid = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { emailAddress, selectedProvider } = req.params
  const { token } = req.body

  // Verify the JWT token
  const isTokenValid = await verifyToken(emailAddress, token)
  if (!isTokenValid) {
    return res.sendStatus(401)
  }

  let userUUID

  const user = await UserOperations.findUserAccountByEmail(
    req.params.emailAddress
  )
  userUUID = user?.id

  // If no user is found, create
  if (!user) {
    if (!selectedProvider) {
      console.error('No selectedProvider provided')
      return res.sendStatus(500)
    }
    const newUserUUID = await UserOperations.createUserAccount(
      emailAddress,
      selectedProvider as UserAccountType
    )
    userUUID = newUserUUID
  }

  try {
    const token = await issueUserToken({
      apiKeyName: config.coinbaseCloudApiKeyName as string,
      privateKey: config.coinbaseCloudPrivateKey as string,
      userID: userUUID as string,
    })
    res.json({ token })
  } catch (error) {
    console.error(
      'Error issuing Coinbase WAAS token for user',
      userUUID,
      error.message
    )
    return res
      .sendStatus(400)
      .json('Error issuing Coinbase WAAS token for user')
  }
}

export const retrieveRecoveryPhrase = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { emailAddress } = req.params
  const ejected = await UserOperations.ejectionStatus(emailAddress)

  if (ejected) {
    return res.sendStatus(404)
  }
  const result =
    await UserOperations.getUserRecoveryPhraseByEmailAddress(emailAddress)

  if (result) {
    return res.json({ recoveryPhrase: result })
  }
  // Create a fake recoveryPhrase
  const recoveryPhrase = (Math.random() + 1).toString(36)
  return res.json({ recoveryPhrase })
}

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  const { emailAddress } = req.params
  const { user } = req.body.message
  const ejected = await UserOperations.ejectionStatus(emailAddress)

  if (ejected) {
    return res.sendStatus(404)
  }
  try {
    const result = await UserOperations.updateEmail(
      emailAddress,
      user.emailAddress
    )

    if (result?.[0] == 0) {
      return res.sendStatus(400)
    }
    return res.sendStatus(202)
  } catch (error) {
    return res.sendStatus(400)
  }
}

export const updatePaymentDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { publicKey } = req.body.message.user
  const { emailAddress } = req.params
  const token = req.body.message.user.stripeTokenId
  const ejected = await UserOperations.ejectionStatus(emailAddress)

  if (ejected) {
    return res.sendStatus(404)
  }
  const result = await UserOperations.updatePaymentDetails(token, publicKey)

  if (result) {
    return res.sendStatus(202)
  }
  return res.sendStatus(400)
}

export const updateAddressPaymentDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ethereumAddress } = req.params

  if (ethereumAddress == null) {
    return res.sendStatus(401)
  } else if (ethereumAddress != req.owner) {
    return res.sendStatus(401)
  }
  const token = req.body.message['Save Card'].stripeTokenId

  const result = await UserOperations.updatePaymentDetails(
    token,
    ethereumAddress
  )

  if (result) {
    return res.sendStatus(202)
  }
  return res.sendStatus(400)
}

export const getAddressPaymentDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ethereumAddress } = req.params
  if (!ethereumAddress || !req.signee) {
    return res.sendStatus(401)
  } else if (
    Normalizer.ethereumAddress(ethereumAddress) !==
    Normalizer.ethereumAddress(req.signee)
  ) {
    return res.sendStatus(401)
  }

  const stripeCustomerId =
    await StripeOperations.getStripeCustomerIdForAddress(ethereumAddress)
  if (!stripeCustomerId) {
    return res.json([])
  }
  const result = await UserOperations.getCardDetailsFromStripe(stripeCustomerId)

  return res.json(result)
}

export const deleteAddressPaymentDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ethereumAddress } = req.params

  if (!ethereumAddress || !req.signee) {
    return res.sendStatus(401)
  } else if (
    Normalizer.ethereumAddress(ethereumAddress) !==
    Normalizer.ethereumAddress(req.signee)
  ) {
    return res.sendStatus(401)
  }

  const result =
    await StripeOperations.deletePaymentDetailsForAddress(ethereumAddress)

  if (result) {
    return res.sendStatus(202)
  }
  return res.sendStatus(400)
}

export const updatePasswordEncryptedPrivateKey = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { user } = req.body.message
  const { publicKey } = user
  const { passwordEncryptedPrivateKey } = user

  const ejected = await UserOperations.ejectionStatusByAddress(publicKey)

  if (ejected) {
    return res.sendStatus(404)
  }

  const result = await UserOperations.updatePasswordEncryptedPrivateKey(
    publicKey,
    passwordEncryptedPrivateKey
  )

  if (result[0] != 0) {
    return res.sendStatus(202)
  }
  return res.sendStatus(400)
}

export const cards = async (req: Request, res: Response) => {
  const { emailAddress } = req.params
  const result = await UserOperations.getCards(emailAddress)
  return res.json(result)
}

export const eject = async (req: Request, res: Response) => {
  const address = req.params.ethereumAddress
  const ejected = await UserOperations.ejectionStatusByAddress(address)

  if (
    Normalizer.ethereumAddress(address) != Normalizer.ethereumAddress(req.owner)
  ) {
    return res.sendStatus(401)
  }

  if (ejected) {
    return res.sendStatus(400)
  }

  const result = await UserOperations.eject(address)

  if (result[0] > 0) {
    return res.sendStatus(202)
  }
  return res.sendStatus(400)
}

export const exist = async (request: Request, response: Response) => {
  const { emailAddress } = request.params
  const userAccountType = await UserOperations.findTypeByEmail(emailAddress)

  if (!userAccountType) {
    return response.sendStatus(404)
  }
  return response.status(200).json({ userAccountType })
}

const UserController = {
  createUser,
  userCreationStatus,
  retrieveEncryptedPrivatekey,
  retrieveWaasUuid,
  retrieveRecoveryPhrase,
  updateUser,
  updatePaymentDetails,
  updateAddressPaymentDetails,
  getAddressPaymentDetails,
  deleteAddressPaymentDetails,
  updatePasswordEncryptedPrivateKey,
  cards,
  eject,
  exist,
}

export default UserController
