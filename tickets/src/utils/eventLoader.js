import TicketService from '../services/ticketService'

/**
 * Given a page context, returns a slug and post object
 * @param context
 * @returns {Promise<{slug: string, post: {}}>}
 */
const prepareEventProps = async context => {
  const { lockAddress } = context.query
  const ticketService = new TicketService('')

  return await ticketService.getEvent(lockAddress)
}

export default prepareEventProps
