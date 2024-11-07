import { Request, Response } from 'express'
import StripeOperations from '../operations/stripeOperations'
import * as Normalizer from '../utils/normalizer'
import UserOperations from '../operations/userOperations'
import logger from '../logger'
import { ethers } from 'ethers'
import { MemoryCache } from 'memory-cache-node'
import { issueUserToken } from '@coinbase/waas-server-auth'
import config from '../config/config'
import { verifyNextAuthToken } from '../utils/verifyNextAuthToken'
import { z } from 'zod'
import { generateVerificationCode } from '../utils/generateVerificationCode'
import VerificationCodes from '../models/verificationCodes'
import { sendEmail } from '../operations/wedlocksOperations'

// Decoy users are cached for 15 minutes
const cacheDuration = 60 * 15
const decoyUserCache = new MemoryCache<string, any>(cacheDuration / 5, 1000)

export const enum UserAccountType {
  UnlockAccount = 'UNLOCK_ACCOUNT',
  GoogleAccount = 'GOOGLE_ACCOUNT',
  PasskeyAccount = 'PASSKEY_ACCOUNT',
  EmailCodeAccount = 'EMAIL_CODE',
}

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { user } = req.body.message

    if (user) {
      const { emailAddress } = user
      const ejected = await UserOperations.ejectionStatus(emailAddress)

      if (ejected) {
        res.sendStatus(409)
        return
      }
      const creationStatus = await userCreationStatus(user)
      const { recoveryPhrase } = creationStatus

      res.status(creationStatus.status).json({ recoveryPhrase })
      return
    }
    res.sendStatus(400)
    return
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json(error.errors)
      return
    } else {
      logger.error('Failed to create user', error)
      res.sendStatus(400)
      return
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

async function getJSONWallet(wallet: ethers.HDNodeWallet | ethers.Wallet) {
  const address = await wallet.getAddress()
  const { privateKey } = wallet

  const account = {
    address,
    privateKey,
  }

  let accountMnemonic
  if (
    'mnemonic' in wallet &&
    wallet.mnemonic &&
    wallet.mnemonic.wordlist.locale === 'en' &&
    wallet.mnemonic.password === '' &&
    wallet.path
  ) {
    accountMnemonic = {
      path: wallet.path,
      locale: 'en',
      entropy: wallet.mnemonic.entropy,
    }
  }

  return { ...account, mnemonic: accountMnemonic }
}

export const retrieveEncryptedPrivatekey = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { emailAddress } = req.params
  const ejected = await UserOperations.ejectionStatus(emailAddress)

  if (ejected) {
    res.sendStatus(404)
    return
  }

  const result =
    await UserOperations.getUserPrivateKeyByEmailAddress(emailAddress)

  if (result) {
    res.json({ passwordEncryptedPrivateKey: result })
    return
  } else {
    let passwordEncryptedPrivateKey =
      decoyUserCache.retrieveItemValue(emailAddress)
    if (!passwordEncryptedPrivateKey) {
      const randomWallet = await ethers.Wallet.createRandom()
      const jsonWallet = await getJSONWallet(randomWallet)
      passwordEncryptedPrivateKey = await ethers.encryptKeystoreJson(
        jsonWallet,
        (Math.random() + 1).toString(36),
        {
          scrypt: {
            // web3 used 1 << 5, ethers default is 1 << 18. We want speedy encryption here since this is not a real account anyway.

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

    res.json({
      passwordEncryptedPrivateKey,
    })
    return
  }
}

const RetrieveWaasUuidBodySchema = z.object({
  token: z.string(),
})

export const retrieveWaasUuid = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { emailAddress, selectedProvider } = req.params
  const { token } = RetrieveWaasUuidBodySchema.parse(req.body)

  if (!token) {
    res.sendStatus(401)
    return
  }

  // Verify the JWT token
  const isTokenValid = await verifyNextAuthToken(
    selectedProvider as UserAccountType,
    emailAddress,
    token
  )
  if (!isTokenValid) {
    res.status(401).json({
      message: 'There was an error verifying the token or it is not valid',
    })
    return
  }

  let userUUID

  const user = await UserOperations.findUserAccountByEmail(
    req.params.emailAddress
  )

  userUUID = user?.id

  // If no user is found, create
  if (!user) {
    const userAccountType = selectedProvider as UserAccountType
    if (!userAccountType) {
      logger.error('No selectedProvider provided')
      res.status(500).json({ message: 'No selectedProvider provided' })
      return
    }
    if (userAccountType === UserAccountType.UnlockAccount) {
      logger.error('Creating a user with UnlockAccount type is not allowed')
      res.status(500).json({
        message: 'Creating a user with UnlockAccount type is not allowed',
      })
      return
    }
    const newUserUUID = await UserOperations.createUserAccount(
      emailAddress,
      selectedProvider as UserAccountType
    )
    userUUID = newUserUUID

    await sendEmail({
      template: 'welcome',
      recipient: emailAddress,
    })
  }

  try {
    const token = await issueUserToken({
      apiKeyName: config.coinbaseCloudApiKeyName as string,
      privateKey: config.coinbaseCloudPrivateKey as string,
      userID: userUUID as string,
    })
    res.json({ token })
  } catch (error) {
    logger.error(
      'Error issuing Coinbase WAAS token for user',
      userUUID,
      error.message
    )
    res
      .status(400)
      .json({ message: 'Error issuing Coinbase WAAS token for user' })
    return
  }
}

export const retrieveRecoveryPhrase = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { emailAddress } = req.params
  const ejected = await UserOperations.ejectionStatus(emailAddress)

  if (ejected) {
    res.sendStatus(404)
    return
  }
  const result =
    await UserOperations.getUserRecoveryPhraseByEmailAddress(emailAddress)

  if (result) {
    res.json({ recoveryPhrase: result })
    return
  }
  // Create a fake recoveryPhrase
  const recoveryPhrase = (Math.random() + 1).toString(36)
  res.json({ recoveryPhrase })
  return
}

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  const { emailAddress } = req.params
  const { user } = req.body.message
  const ejected = await UserOperations.ejectionStatus(emailAddress)

  if (ejected) {
    res.sendStatus(404)
    return
  }
  try {
    const result = await UserOperations.updateEmail(
      emailAddress,
      user.emailAddress
    )

    if (result?.[0] == 0) {
      res.sendStatus(400)
      return
    }
    res.sendStatus(202)
    return
  } catch (error) {
    res.sendStatus(400)
    return
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
    res.sendStatus(404)
    return
  }
  const result = await UserOperations.updatePaymentDetails(token, publicKey)

  if (result) {
    res.sendStatus(202)
    return
  }
  res.sendStatus(400)
  return
}

export const updateAddressPaymentDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ethereumAddress } = req.params

  if (ethereumAddress == null) {
    res.sendStatus(401)
    return
  } else if (ethereumAddress != req.owner) {
    res.sendStatus(401)
    return
  }
  const token = req.body.message['Save Card'].stripeTokenId

  const result = await UserOperations.updatePaymentDetails(
    token,
    ethereumAddress
  )

  if (result) {
    res.sendStatus(202)
    return
  }
  res.sendStatus(400)
  return
}

export const getAddressPaymentDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ethereumAddress } = req.params
  if (!ethereumAddress || !req.signee) {
    res.sendStatus(401)
    return
  } else if (
    Normalizer.ethereumAddress(ethereumAddress) !==
    Normalizer.ethereumAddress(req.signee)
  ) {
    res.sendStatus(401)
    return
  }

  const stripeCustomerId =
    await StripeOperations.getStripeCustomerIdForAddress(ethereumAddress)
  if (!stripeCustomerId) {
    res.json([])
    return
  }
  const result = await UserOperations.getCardDetailsFromStripe(stripeCustomerId)

  res.json(result)
  return
}

export const deleteAddressPaymentDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ethereumAddress } = req.params

  if (!ethereumAddress || !req.signee) {
    res.sendStatus(401)
    return
  } else if (
    Normalizer.ethereumAddress(ethereumAddress) !==
    Normalizer.ethereumAddress(req.signee)
  ) {
    res.sendStatus(401)
    return
  }

  const result =
    await StripeOperations.deletePaymentDetailsForAddress(ethereumAddress)

  if (result) {
    res.sendStatus(202)
    return
  }
  res.sendStatus(400)
  return
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
    res.sendStatus(404)
    return
  }

  const result = await UserOperations.updatePasswordEncryptedPrivateKey(
    publicKey,
    JSON.parse(passwordEncryptedPrivateKey)
  )

  if (result[0] != 0) {
    res.sendStatus(202)
    return
  }
  res.sendStatus(400)
  return
}

export const cards = async (req: Request, res: Response) => {
  const { emailAddress } = req.params
  const result = await UserOperations.getCards(emailAddress)
  res.json(result)
  return
}

export const eject = async (req: Request, res: Response) => {
  const address = req.params.ethereumAddress
  const ejected = await UserOperations.ejectionStatusByAddress(address)

  if (
    Normalizer.ethereumAddress(address) != Normalizer.ethereumAddress(req.owner)
  ) {
    res.sendStatus(401)
    return
  }

  if (ejected) {
    res.sendStatus(400)
    return
  }

  const result = await UserOperations.eject(address)

  if (result[0] > 0) {
    res.sendStatus(202)
    return
  }
  res.sendStatus(400)
  return
}

export const exist = async (request: Request, response: Response) => {
  const { emailAddress } = request.params
  const user = await UserOperations.findByEmail(emailAddress)

  if (!user) {
    response.sendStatus(404)
    return
  }
  response.sendStatus(200)
  return
}

// Method used for nextAuth
export const existNextAuth = async (request: Request, response: Response) => {
  const { emailAddress } = request.params
  const userAccountType =
    await UserOperations.findLoginMethodsByEmail(emailAddress)

  if (!userAccountType) {
    response.sendStatus(404)
    return
  }
  response.status(200).json({ userAccountType })
  return
}

export const sendVerificationCode = async (
  request: Request,
  response: Response
) => {
  const { emailAddress } = request.params
  const currentTime = new Date()

  try {
    let verificationEntry = await VerificationCodes.findOne({
      where: { emailAddress },
    })

    if (
      !verificationEntry ||
      verificationEntry.codeExpiration < currentTime ||
      verificationEntry.isCodeUsed
    ) {
      const { code, expiration } = generateVerificationCode()

      if (verificationEntry) {
        await verificationEntry.update({
          code,
          codeExpiration: expiration,
          isCodeUsed: false,
          token: crypto.randomUUID(),
          tokenExpiration: new Date(Date.now() + 60 * 60 * 1000),
        })
      } else {
        verificationEntry = await VerificationCodes.create({
          emailAddress,
          code,
          codeExpiration: expiration,
          token: crypto.randomUUID(),
          tokenExpiration: new Date(Date.now() + 60 * 60 * 1000),
        })
      }
    }

    await sendEmail({
      template: 'nextAuthCode',
      recipient: emailAddress,
      params: {
        code: verificationEntry.code,
      },
    })

    response.status(200).json({
      message: 'Email code sent',
    })
  } catch (error) {
    logger.error('Error sending verification code:', error)
    response.status(500).send('Error sending verification code')
  }
}

export const verifyEmailCode = async (request: Request, response: Response) => {
  const { emailAddress } = request.params
  const { code } = request.body

  if (!emailAddress || !code) {
    response.sendStatus(400).json({ message: 'Missing parameters' })
    return
  }

  try {
    const verificationEntry = await VerificationCodes.findOne({
      where: { emailAddress },
    })

    if (!verificationEntry) {
      response.status(404).json({ message: 'Verification code not found' })
      return
    }

    const currentTime = new Date()
    if (
      verificationEntry.code === code &&
      verificationEntry.codeExpiration > currentTime &&
      !verificationEntry.isCodeUsed
    ) {
      verificationEntry.update({ isCodeUsed: true })
      response.status(200).json({
        message: 'Verification successful',
        token: verificationEntry.token,
      })
      return
    } else if (verificationEntry.codeExpiration <= currentTime) {
      response.status(400).json({ message: 'Verification code has expired' })
      return
    } else if (verificationEntry.isCodeUsed) {
      response
        .status(400)
        .json({ message: 'Verification code has already been used' })
      return
    } else {
      response.status(400).json({ message: 'Invalid verification code' })
      return
    }
  } catch (error) {
    logger.error('Error verifying email code:', error)
    response.status(500).json({ message: 'Error verifying email code' })
    return
  }
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
  existNextAuth,
  sendVerificationCode,
  verifyEmailCode,
}

export default UserController
