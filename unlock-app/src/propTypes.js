import PropTypes from 'prop-types'
import React from 'react'

export const account = PropTypes.shape({
  address: PropTypes.string,
  privateKey: PropTypes.string,
  balance: PropTypes.string, // Too big to be a number
})
export const address = PropTypes.string

export const lock = PropTypes.shape({
  keyReleaseMechanism: PropTypes.string,
  keyPrice: PropTypes.string,
  maxNumberOfKeys: PropTypes.string,
  owner: PropTypes.string,
  outstandingKeys: PropTypes.string,
})

export const transaction = PropTypes.shape({
  status: PropTypes.string,
})

export const children = PropTypes.shape({})

export const component = PropTypes.func

// TODO
export const configuration = PropTypes.shape({
})

export const mechanism = PropTypes.oneOf(['0', '1', '2', undefined])

export const layout = PropTypes.instanceOf(Function) //PropTypes.instanceOf(React.Component)

export const locks = PropTypes.arrayOf(lock)

export const key = PropTypes.shape({})

export const network = PropTypes.shape({})

export const networks = PropTypes.shape({})

export default {
  account,
  children,
  component,
  configuration,
  layout,
  lock,
  locks,
  key,
  network,
  networks,
  mechanism,
  transaction,
}