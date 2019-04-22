/* eslint promise/prefer-await-to-then: 0 */

import TicketService from '../services/ticketService'
import { ADD_EVENT, LOAD_EVENT, ticketError } from '../actions/ticket'

const ticketMiddleware = config => {
  const { services } = config
  return ({ setState, dispatch }) => {
    const ticketService = new TicketService(services.storage.host)

    return next => {
      return action => {
        if (action.type == ADD_EVENT) {
          ticketService
            .createEvent(action.event, action.token)
            .catch(error => dispatch(ticketError(error)))
        }
        if (action.type == LOAD_EVENT) {
          ticketService.getEvent(action.address).then(res => {
            const { name, date, lockAddress, description, location } = res.data
            const event = {
              name,
              date: new Date(date),
              lockAddress,
              description,
              location,
            }
            setState({ event })
          })
        }
        next(action)
      }
    }
  }
}

export default ticketMiddleware
