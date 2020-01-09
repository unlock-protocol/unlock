import PropTypes from 'prop-types'
import { TransactionType } from './unlockTypes'

export const address = PropTypes.string

export const account = PropTypes.shape({
  address,
  privateKey: PropTypes.string,
  balance: PropTypes.string, // Must be expressed in Eth!
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
  unlimitedKeys: PropTypes.bool,
})

export const transaction = PropTypes.shape({
  status: PropTypes.string,
  confirmations: PropTypes.number,
  createdAt: PropTypes.number,
  hash: PropTypes.string,
  lock: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(Object.values(TransactionType)),
})

export const error = PropTypes.shape({
  name: PropTypes.string,
  data: PropTypes.shape({}),
})

export const conversion = PropTypes.objectOf(PropTypes.number)

export const children = PropTypes.shape({})

export const component = PropTypes.func

export const configuration = PropTypes.shape({})

export const mechanism = PropTypes.oneOf(['0', '1', '2', undefined])

export const layout = PropTypes.instanceOf(Function) // PropTypes.instanceOf(React.Component)

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

export const post = PropTypes.shape({
  title: PropTypes.string,
  description: PropTypes.string,
  subTitle: PropTypes.string,
  authorName: PropTypes.string,
  publishDate: PropTypes.string,
  __content: PropTypes.string,
})

export const slug = PropTypes.string

export const postFeed = PropTypes.array

export const router = PropTypes.shape({
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
    hash: PropTypes.string,
  }),
  action: PropTypes.string,
})

export default {
  account,
  address,
  children,
  component,
  configuration,
  conversion,
  delay,
  element,
  error,
  key,
  keys,
  layout,
  lock,
  locks,
  mechanism,
  name,
  network,
  networks,
  post,
  postFeed,
  provider,
  router,
  showDashboardForm,
  slug,
  status,
  transaction,
  transactions,
}
