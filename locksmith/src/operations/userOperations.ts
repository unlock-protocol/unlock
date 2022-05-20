import Stripe from 'stripe'
import Sequelize from 'sequelize'
import { ethereumAddress, UserCreationInput } from '../types' // eslint-disable-line no-unused-vars, import/named
import * as Normalizer from '../utils/normalizer'
import { PaymentProcessor } from '../payment/paymentProcessor'
import { getStripeCustomerIdForAddress } from './stripeOperations'

import RecoveryPhrase = require('../utils/recoveryPhrase')

// eslint-disable-line no-unused-vars

const config = require('../../config/config')
const models = require('../models')

const { User, UserReference } = models

const { Op } = Sequelize

namespace UserOperations {
  export const createUser = async (
    input: UserCreationInput
  ): Promise<string | undefined> => {
    const recoveryPhrase = RecoveryPhrase.generate()
    const publicKey = Normalizer.ethereumAddress(input.publicKey)
    const userReference = await UserReference.create(
      {
        emailAddress: Normalizer.emailAddress(input.emailAddress),
        publicKey,
        User: {
          publicKey,
          recoveryPhrase,
          passwordEncryptedPrivateKey: input.passwordEncryptedPrivateKey,
        },
      },
      {
        include: User,
      }
    )

    if (userReference) {
      return recoveryPhrase
    }

    return undefined
  }

  export const getUserPrivateKeyByEmailAddress = async (
    emailAddress: string
  ): Promise<string | null> => {
    const user = await UserReference.findOne({
      where: { emailAddress: Normalizer.emailAddress(emailAddress) },
      include: [{ model: User, attributes: ['passwordEncryptedPrivateKey'] }],
    })

    if (user) {
      return user.User.passwordEncryptedPrivateKey
    }
    return null
  }

  export const ejectionStatus = async (
    emailAddress: string
  ): Promise<boolean> => {
    try {
      const user = await UserReference.findOne({
        where: {
          emailAddress: Normalizer.emailAddress(emailAddress),
        },
        include: [{ model: User, attributes: ['ejection'] }],
      })

      return !!user.User.ejection
    } catch (e) {
      return false
    }
  }

  export const ejectionStatusByAddress = async (
    publicKey: string
  ): Promise<boolean> => {
    try {
      const ejectedUser = await User.findOne({
        where: {
          publicKey: Normalizer.ethereumAddress(publicKey),
          ejection: {
            [Op.ne]: null,
          },
        },
      })

      return !!ejectedUser
    } catch (e) {
      return false
    }
  }

  export const getUserRecoveryPhraseByEmailAddress = async (
    emailAddress: string
  ): Promise<string | null> => {
    try {
      const user = await UserReference.findOne({
        where: {
          emailAddress: Normalizer.emailAddress(emailAddress),
        },
        include: [{ model: User, attributes: ['recoveryPhrase'] }],
      })

      if (user) {
        return user.User.recoveryPhrase
      }
      return null
    } catch (e) {
      return null
    }
  }

  export const updateEmail = async (
    existingEmailAddress: string,
    updatedEmailAddress: string
  ) => {
    try {
      const result = await UserReference.update(
        { emailAddress: Normalizer.emailAddress(updatedEmailAddress) },
        {
          where: {
            emailAddress: {
              [Op.eq]: Normalizer.emailAddress(existingEmailAddress),
            },
          },
        }
      )
      return result
    } catch (e) {
      return null
    }
  }

  export const updatePaymentDetails = async (
    token: string,
    publicKey: string
  ): Promise<boolean> => {
    const paymentProcessor = new PaymentProcessor(config.stripeSecret)
    return await paymentProcessor.updateUserPaymentDetails(token, publicKey)
  }

  export const updatePasswordEncryptedPrivateKey = async (
    publicKey: ethereumAddress,
    passwordEncryptedPrivateKey: string
  ) => {
    return User.update(
      { passwordEncryptedPrivateKey },
      {
        where: {
          publicKey: {
            [Op.eq]: Normalizer.ethereumAddress(publicKey),
          },
        },
      }
    )
  }

  export const getCards = async (emailAddress: string): Promise<any[]> => {
    const user = await UserReference.findOne({
      where: { emailAddress: Normalizer.emailAddress(emailAddress) },
    })
    if (user && user.publicKey) {
      const customerId = await getStripeCustomerIdForAddress(user.publicKey)
      if (customerId) {
        return getCardDetailsFromStripe(customerId)
      }
      return []
    }
    return []
  }
  export const getCardDetailsFromStripe = async (
    customer_id: any
  ): Promise<any[]> => {
    const stripe = new Stripe(config.stripeSecret, {
      apiVersion: '2020-08-27',
    })

    try {
      const cardsResponse = await stripe.customers.listSources(customer_id, {
        object: 'card',
      })

      return cardsResponse.data
    } catch (_e) {
      return []
    }
  }

  export const eject = async (publicKey: ethereumAddress): Promise<any> => {
    return await User.update(
      { ejection: Date.now() },
      {
        where: {
          publicKey: {
            [Op.eq]: Normalizer.ethereumAddress(publicKey),
          },
        },
      }
    )
  }

  export const findByEmail = async (emailAddress: string) => {
    const user = await UserReference.findOne({
      where: {
        emailAddress: Normalizer.emailAddress(emailAddress),
      },
    })
    return user
  }
}

export = UserOperations
