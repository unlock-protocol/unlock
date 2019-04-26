import * as Sequelize from 'sequelize'
import Normalizer from '../utils/normalizer'
import { EventCreation } from '../types' // eslint-disable-line no-unused-vars

const models = require('../models')

const { Event } = models
const Op = Sequelize.Op

namespace EventOperations {
  export const create = (event: EventCreation): Promise<any> => {
    event.owner = Normalizer.ethereumAddress(event.owner)
    event.lockAddress = Normalizer.ethereumAddress(event.lockAddress)
    return Event.create(event)
  }

  export const update = async (event: EventCreation): Promise<any> => {
    event.owner = Normalizer.ethereumAddress(event.owner)
    event.lockAddress = Normalizer.ethereumAddress(event.lockAddress)
    return await Event.update(event, {
      where: {
        lockAddress: {
          [Op.eq]: Normalizer.ethereumAddress(event.lockAddress),
        },
        owner: {
          [Op.eq]: Normalizer.ethereumAddress(event.owner),
        },
      },
      raw: true,
    })
  }

  export const find = async (lockAddress: string): Promise<any> => {
    return Event.findOne({
      where: {
        lockAddress: { [Op.eq]: Normalizer.ethereumAddress(lockAddress) },
      },
    })
  }
}

export = EventOperations
