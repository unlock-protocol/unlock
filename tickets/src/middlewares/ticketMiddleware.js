/* eslint promise/prefer-await-to-then: 0 */

import TicketService from '../services/ticketService'
import {
  ADD_EVENT,
  LOAD_EVENT,
  updateEvent,
  ticketError,
} from '../actions/ticket'
import { signData, SIGNED_DATA } from '../actions/signature'
import UnlockEvent from '../structured_data/unlockEvent'

const ticketMiddleware = config => {
  const { services } = config
  return ({ dispatch }) => {
    const ticketService = new TicketService(services.storage.host)

    return next => {
      return action => {
        // Initial event to add a new ticketed event: here we process data and send for signing
        if (action.type === ADD_EVENT) {
          const {
            lockAddress,
            name,
            description,
            location,
            date,
            owner,
            logo,
          } = action.event
          const data = UnlockEvent.build({
            lockAddress,
            name,
            description,
            location,
            date,
            owner,
            logo,
          })
          // We need to sign the data before we can store it
          dispatch(signData(data))
        }

        // Once our ticketed event data has come back with a signature, we can store it in locksmith
        if (
          action.type === SIGNED_DATA &&
          action.data.message &&
          action.data.message.event
        ) {
          ticketService
            .saveEvent(action.data.message.event, action.signature)
            .catch(error => dispatch(ticketError(error)))
        }

        // Load an event from locksmith
        if (action.type === LOAD_EVENT) {
          ticketService.getEvent(action.address).then(res => {
            const { name, date, lockAddress, description, location } = res.data
            const event = {
              name,
              date: new Date(date),
              lockAddress,
              description,
              location,
            }
            dispatch(updateEvent(event))
          })
        }
        next(action)
      }
    }
  }
}

export default ticketMiddleware
