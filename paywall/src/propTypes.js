import PropTypes from 'prop-types'
import { TRANSACTION_TYPES } from './constants'

export const address = PropTypes.string

// Object of currency: value
export const balance = PropTypes.shape({})

export const account = PropTypes.shape({
  address: address,
  privateKey: PropTypes.string,
  balance,
})

export const lock = PropTypes.shape({
  address,
  name: PropTypes.string,
  expirationDuration: PropTypes.number,
  keyPrice: PropTypes.string, // Must be expressed in Eth!
  maxNumberOfKeys: PropTypes.number,
  owner: PropTypes.string,
  outstandingKeys: PropTypes.number,
  balance: PropTypes.string, // Must be expressed in Eth!
})

export const transaction = PropTypes.shape({
  status: PropTypes.string,
  confirmations: PropTypes.number,
  createdAt: PropTypes.number,
  hash: PropTypes.string,
  lock: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(Object.values(TRANSACTION_TYPES)),
})

export const conversion = PropTypes.objectOf(PropTypes.number)

export const children = PropTypes.shape({})

export const component = PropTypes.func

// TODO
export const configuration = PropTypes.shape({})

export const mechanism = PropTypes.oneOf(['0', '1', '2', undefined])

export const layout = PropTypes.instanceOf(Function) //PropTypes.instanceOf(React.Component)

export const locks = PropTypes.objectOf(PropTypes.object)

export const transactions = PropTypes.shape({})

export const key = PropTypes.shape({
  lock: address,
  expiration: PropTypes.number,
})

export const keys = PropTypes.objectOf(key)

export const network = PropTypes.shape({})

export const provider = PropTypes.string

export const networks = PropTypes.shape({})

export const status = PropTypes.string

export const name = PropTypes.string

export const showDashboardForm = PropTypes.bool

export const element = PropTypes.oneOfType([PropTypes.func, PropTypes.element])

export const delay = PropTypes.number

export const keyList = PropTypes.arrayOf(key)

export default {
  account,
  address,
  children,
  component,
  configuration,
  conversion,
  delay,
  element,
  layout,
  lock,
  locks,
  key,
  keyList,
  keys,
  name,
  network,
  networks,
  mechanism,
  provider,
  transaction,
  transactions,
  status,
  showDashboardForm,
}
