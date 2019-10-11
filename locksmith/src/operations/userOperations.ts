import Stripe from 'stripe'
import { ethereumAddress, UserCreationInput } from '../types' // eslint-disable-line no-unused-vars, import/named
import * as Normalizer from '../utils/normalizer'
import { PaymentProcessor } from '../payment/paymentProcessor'
// eslint-disable-line no-unused-vars
import RecoveryPhrase = require('../utils/recoveryPhrase')

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]
const models = require('../models')

const { User, UserReference } = models
import Sequelize = require('sequelize')

const Op = Sequelize.Op

namespace UserOperations {
  export const createUser = async (
    input: UserCreationInput
  ): Promise<String | undefined> => {
    let recoveryPhrase = RecoveryPhrase.generate()
    let userReference = await UserReference.create(
      {
        emailAddress: Normalizer.emailAddress(input.emailAddress),
        User: {
          publicKey: Normalizer.ethereumAddress(input.publicKey),
          recoveryPhrase: recoveryPhrase,
          passwordEncryptedPrivateKey: input.passwordEncryptedPrivateKey,
        },
      },
      {
        include: User,
      }
    )

    if (userReference) {
      return recoveryPhrase
    } else {
      return
    }
  }

  export const getUserPrivateKeyByEmailAddress = async (
    emailAddress: string
  ): Promise<string | null> => {
    let user = await UserReference.findOne({
      where: { emailAddress: Normalizer.emailAddress(emailAddress) },
      include: [{ model: User, attributes: ['passwordEncryptedPrivateKey'] }],
    })

    if (user) {
      return user.User.passwordEncryptedPrivateKey
    } else {
      return null
    }
  }

  export const ejectionStatus = async (
    emailAddress: string
  ): Promise<boolean> => {
    try {
      let user = await UserReference.findOne({
        where: {
          emailAddress: Normalizer.emailAddress(emailAddress),
        },
        include: [{ model: User, attributes: ['ejection'] }],
      })

      return user.User.ejection ? true : false
    } catch (e) {
      return false
    }
  }

  export const getUserRecoveryPhraseByEmailAddress = async (
    emailAddress: string
  ): Promise<string | null> => {
    try {
      let user = await UserReference.findOne({
        where: {
          emailAddress: Normalizer.emailAddress(emailAddress),
        },
        include: [{ model: User, attributes: ['recoveryPhrase'] }],
      })

      if (user) {
        return user.User.recoveryPhrase
      } else {
        return null
      }
    } catch (e) {
      return null
    }
  }

  export const updateEmail = async (
    existingEmailAddress: string,
    updatedEmailAddress: string
  ) => {
    try {
      let result = await UserReference.update(
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
    let paymentProcessor = new PaymentProcessor(
      config.stripeSecret,
      config.web3ProviderHost,
      config.unlockContractAddress
    )
    return await paymentProcessor.updateUserPaymentDetails(token, publicKey)
  }

  export const updatePasswordEncryptedPrivateKey = async (
    publicKey: ethereumAddress,
    passwordEncryptedPrivateKey: string
  ) => {
    return User.update(
      { passwordEncryptedPrivateKey: passwordEncryptedPrivateKey },
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
    let user = await UserReference.findOne({
      where: { emailAddress: Normalizer.emailAddress(emailAddress) },
    })

    if (user) {
      return getCardDetailsFromStripe(user.stripe_customer_id)
    } else {
      return []
    }
  }

  const getCardDetailsFromStripe = async (customer_id: any): Promise<any[]> => {
    let stripe = new Stripe(config.stripeSecret)

    try {
      let cardsResponse = await stripe.customers.listSources(customer_id, {
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
}

export = UserOperations
