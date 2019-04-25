// eslint-disable-next-line no-unused-vars, import/no-unresolved
import { Request, Response } from 'express-serve-static-core'

const eventOperation = require('../operations/eventOperations')

namespace EventController {
  export const create = async (req: Request, res: Response): Promise<any> => {
    let event = req.body.message.event

    try {
      await eventOperation.create(event)

      return res.sendStatus(200)
    } catch (e) {
      return res.sendStatus(409)
    }
  }

  export const save = async (req: Request, res: Response): Promise<any> => {
    let event = req.body.message.event
    let lockAddress = req.params.lockAddress
    try {
      const databaseEvent = await eventOperation.find(lockAddress)
      if (
        databaseEvent.owner !== event.owner ||
        databaseEvent.lockAddress != lockAddress
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
    let lockAddress = req.params.lockAddress
    let event = await eventOperation.find(lockAddress)

    if (event) {
      return res.json(event.toJSON())
    } else {
      return res.sendStatus(404)
    }
  }
}

export = EventController
