// eslint-disable-next-line no-unused-vars, import/no-unresolved
import { Request, Response } from 'express-serve-static-core'
import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved
import Normalizer from '../utils/normalizer'

const eventOperation = require('../operations/eventOperations')

namespace EventController {
  export const create = async (req: Request, res: Response): Promise<any> => {
    const { event } = req.body.message

    try {
      await eventOperation.create(event)

      return res.sendStatus(200)
    } catch (e) {
      return res.sendStatus(409)
    }
  }

  export const save = async (req: Request, res: Response): Promise<any> => {
    const { event } = req.body.message
    const { lockAddress } = req.params
    try {
      const databaseEvent = await eventOperation.find(lockAddress)
      if (
        databaseEvent.owner !== Normalizer.ethereumAddress(event.owner) ||
        databaseEvent.lockAddress != Normalizer.ethereumAddress(lockAddress)
      ) {
        return res.sendStatus(401)
      }

      await eventOperation.update(event)
      return res.sendStatus(202)
    } catch (e) {
      return res.sendStatus(409)
    }
  }

  export const find = async (req: Request, res: Response): Promise<any> => {
    const { lockAddress } = req.params

    const event = await eventOperation.find(lockAddress)
    if (event) {
      return res.json(event.toJSON())
    }
    return res.sendStatus(404)
  }

  export const addLinks = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { lockAddress } = req.params
    const { eventLinks } = req.body.message

    const databaseEvent = await eventOperation.find(lockAddress)

    if (databaseEvent.owner != Normalizer.ethereumAddress(req.owner)) {
      return res.sendStatus(401)
    }

    try {
      await eventOperation.addLinks(lockAddress, eventLinks)
      return res.sendStatus(202)
    } catch (e) {
      return res.sendStatus(409)
    }
  }
}

export = EventController
