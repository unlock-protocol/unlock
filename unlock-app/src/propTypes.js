import PropTypes from 'prop-types'

export const account = PropTypes.string
export const adress = PropTypes.string

// All properties are functions.
// TODO: change this because it is confusing.
export const lock = PropTypes.shape({
  keyReleaseMechanism: PropTypes.func,
  keyPrice: PropTypes.func,
  maxNumberOfKeys: PropTypes.func,
  owner: PropTypes.func,
  outstandingKeys: PropTypes.func,
})

export const locks = PropTypes.arrayOf(lock)

export const key = PropTypes.shape({})

export const network = PropTypes.string

export const networks = PropTypes.shape({})

export default {
  account,
  lock,
  locks,
  key,
  network,
  networks,
}