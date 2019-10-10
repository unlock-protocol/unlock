import axios from 'axios'
import UnlockEvent from '../structured_data/unlockEvent'

export default class EventService {
  constructor(host) {
    this.host = host
  }

  genAuthorizationHeader = token => {
    return { Authorization: ` Bearer ${token}` }
  }

  /**
   * Saves an event to locksmith - either creating a new event or updating an existing record.
   * @param {*} event
   * @returns {Promise<*>}
   */
  async saveEvent(
    { lockAddress, name, description, location, date, owner, logo, links },
    token
  ) {
    const opts = {}
    if (token) {
      opts.headers = this.genAuthorizationHeader(token)
    }
    const payload = UnlockEvent.build({
      lockAddress,
      name,
      description,
      location,
      date,
      owner,
      logo,
      links,
    })

    // First check if the event exists
    const res = await axios.get(`${this.host}/events/${lockAddress}`, {
      validateStatus: false,
    })
    if (res.status === 200) {
      try {
        // If so, update the record
        return await axios.put(
          `${this.host}/events/${lockAddress}`,
          payload,
          opts
        )
      } catch (error) {
        return Promise.reject(error)
      }
    } else {
      try {
        // Otherwise create it
        await axios.post(`${this.host}/events/`, payload, opts)
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }

  /**
   * Retrieves new event details from locksmith by its lock address
   * @param {*} lockAddress
   * @returns {Promise<*>}
   */
  async getEvent(lockAddress) {
    try {
      const response = await axios.get(`${this.host}/events/${lockAddress}`)
      let {
        name,
        date,
        description,
        location,
        duration,
        logo,
        image,
        eventLinks,
      } = response.data

      // Hardcoding values
      if (lockAddress === '0xB0ad425cA5792DD4C4Af9177c636e5b0e6c317BF') {
        image =
          'https://assets.unlock-protocol.com/nft-images/ethwaterloo/ethwaterloo-logomark.png'
      }

      if (lockAddress === '0xaA23E8ceBd3817eeEC735Cd9aaF557cCB8e8407C') {
        image =
          'https://assets.unlock-protocol.com/events/coinfund-rabbithole.png'
      }

      return {
        name,
        date: new Date(date),
        lockAddress,
        description,
        location,
        duration,
        logo,
        image,
        links: eventLinks,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
