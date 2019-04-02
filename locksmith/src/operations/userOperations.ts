import { UserCreationInput } from '../types' // eslint-disable-line no-unused-vars
import * as Normalizer from '../utils/normalizer'
// eslint-disable-line no-unused-vars
import RecoveryPhrase = require('../utils/recoveryPhrase')

const models = require('../models')

const { User, UserReference } = models
import Sequelize = require('sequelize')

const Op = Sequelize.Op

namespace UserOperations {
  export const createUser = async (
    input: UserCreationInput
  ): Promise<Boolean> => {
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
      return true
    } else {
      return false
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

  export const getUserRecoveryPhraseByEmailAddress = async (
    emailAddress: string
  ): Promise<string | null> => {
    let user = await UserReference.findOne({
      where: { emailAddress: Normalizer.emailAddress(emailAddress) },
      include: [{ model: User, attributes: ['recoveryPhrase'] }],
    })

    if (user) {
      return user.User.recoveryPhrase
    } else {
      return null
    }
  }

  export const updateEmail = async (
    existingEmailAddress: string,
    updatedEmailAddress: string
  ) => {
    return await UserReference.update(
      { emailAddress: Normalizer.emailAddress(updatedEmailAddress) },
      {
        where: {
          emailAddress: {
            [Op.eq]: Normalizer.emailAddress(existingEmailAddress),
          },
        },
      }
    )
  }
}

export = UserOperations
