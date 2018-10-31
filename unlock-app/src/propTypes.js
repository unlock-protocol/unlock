import PropTypes from 'prop-types'

export const address = PropTypes.string

export const account = PropTypes.shape({
  address: address,
  privateKey: PropTypes.string,
  balance: PropTypes.string, // Too big to be a number
})

export const lock = PropTypes.shape({
  keyReleaseMechanism: PropTypes.string,
  keyPrice: PropTypes.string,
  maxNumberOfKeys: PropTypes.string,
  owner: PropTypes.string,
  outstandingKeys: PropTypes.string,
})

export const transaction = PropTypes.shape({
  status: PropTypes.string,
  confirmations: PropTypes.number,
  createdAt: PropTypes.number,
  hash: PropTypes.string,
  lock: PropTypes.string,
  name: PropTypes.string,
})

export const children = PropTypes.shape({})

export const component = PropTypes.func

// TODO
export const configuration = PropTypes.shape({
})

export const mechanism = PropTypes.oneOf(['0', '1', '2', undefined])

export const layout = PropTypes.instanceOf(Function) //PropTypes.instanceOf(React.Component)

export const locks = PropTypes.shape({})

export const transactions = PropTypes.shape({})

export const key = PropTypes.shape({})

export const keys = PropTypes.shape({})

export const network = PropTypes.shape({})

export const provider = PropTypes.string

export const networks = PropTypes.shape({})

export const status = PropTypes.string

export const name = PropTypes.string

export const showDashboardForm = PropTypes.bool

export default {
  account,
  address,
  children,
  component,
  configuration,
  layout,
  lock,
  locks,
  key,
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
