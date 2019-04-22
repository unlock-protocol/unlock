/* eslint promise/prefer-await-to-then: 0 */

import TicketService from '../services/ticketService'
import { ADD_EVENT, ticketError } from '../actions/ticket'

const ticketMiddleware = config => {
  const { services } = config
  return ({ dispatch }) => {
    const ticketService = new TicketService(services.storage.host)

    return next => {
      return action => {
        if (action.type == ADD_EVENT) {
          ticketService
            .createEvent(action.event, action.token)
            .catch(error => dispatch(ticketError(error)))
        }
        next(action)
      }
    }
  }
}

export default ticketMiddleware
