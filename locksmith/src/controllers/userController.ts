import { Request, Response } from 'express'
import StripeOperations from '../operations/stripeOperations'
import * as Normalizer from '../utils/normalizer'
import UserOperations from '../operations/userOperations'
import logger from '../logger'
import { ethers } from 'ethers'
import { MemoryCache } from 'memory-cache-node'

// Decoy users are cached for 15 minutes
const cacheDuration = 60 * 15
const decoyUserCache = new MemoryCache<string, any>(cacheDuration / 5, 1000)

export const enum UserAccountType {
  UnlockAccount = 'UNLOCK_ACCOUNT',
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

const UserController = {
  createUser,
  userCreationStatus,
  retrieveEncryptedPrivatekey,
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
}

export default UserController
