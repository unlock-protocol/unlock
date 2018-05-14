import PropTypes from 'prop-types'

export const account = PropTypes.shape({
  address: PropTypes.string,
  privateKey: PropTypes.string,
  balance: PropTypes.string, // Too big to be a number
})
export const address = PropTypes.string

// All properties are functions.
// TODO: change this because it is confusing.
export const lock = PropTypes.shape({
  keyReleaseMechanism: PropTypes.func,
  keyPrice: PropTypes.func,
  maxNumberOfKeys: PropTypes.func,
  owner: PropTypes.func,
  outstandingKeys: PropTypes.func,
})

export const mechanism = PropTypes.oneOf(['0', '1', '2', undefined])

export const locks = PropTypes.arrayOf(lock)

export const key = PropTypes.shape({})

export const network = PropTypes.shape({})

export const networks = PropTypes.shape({})

export default {
  account,
  lock,
  locks,
  key,
  network,
  networks,
  mechanism,
}