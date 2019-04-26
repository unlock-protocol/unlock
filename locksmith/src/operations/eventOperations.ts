import * as Sequelize from 'sequelize'
import Normalizer from '../utils/normalizer'
import { EventCreation } from '../types' // eslint-disable-line no-unused-vars
import { EventLink } from '../models'

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
      include: [{ all: true }],
      where: {
        lockAddress: { [Op.eq]: Normalizer.ethereumAddress(lockAddress) },
      },
    })
  }

  export const addLink = async (
    lockAddress: string,
    eventLinks: any
  ): Promise<any> => {
    let event = await Event.findOne({
      include: [{ all: true }],
      where: {
        lockAddress: { [Op.eq]: Normalizer.ethereumAddress(lockAddress) },
      },
    })

    event.eventLinks.forEach(async (element: any) => {
      await element.destroy()
    })

    let bulkLinks = await EventLink.bulkCreate(eventLinks, { returning: true })
    await event.$set('eventLinks', bulkLinks)

    return true
  }
}

export = EventOperations
