import Sequelize from 'sequelize'
import * as Normalizer from '../utils/normalizer'

const models = require('../models')

const { AuthorizedLock } = models

const { Op } = Sequelize

namespace AuthorizedLockOperations {
  // eslint-disable-next-line import/prefer-default-export
  export const hasAuthorization = async (address: string): Promise<boolean> => {
    const authorizedLockCount = await AuthorizedLock.count({
      where: {
        address: {
          [Op.eq]: Normalizer.ethereumAddress(address),
        },
      },
    })

    return authorizedLockCount > 0
  }
}

export = AuthorizedLockOperations
