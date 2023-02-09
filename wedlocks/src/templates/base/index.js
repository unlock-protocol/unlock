import prepare from '../prepare'
import { base } from '@unlock-protocol/email-templates'

export default (opts = {}) => {
  return prepare(base, opts)
}
