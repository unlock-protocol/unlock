import Mailbox from './Mailbox'
import config from './constants'

const mailbox = new Mailbox(config, window)
mailbox.init().catch(e => {
  console.error('startup error', e) // eslint-disable-line
})
