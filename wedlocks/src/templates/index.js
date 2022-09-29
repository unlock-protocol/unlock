import confirmEmail from './confirmEmail'
import welcome from './welcome'
import keyOwnership from './keyOwnership'
import keyMined from './keyMined'
import debug from './debug'

import * as LockTemplates from './locks'

const baseTemplates = {
  confirmEmail,
  welcome,
  keyOwnership,
  keyMined,
  debug,
}

const templates = {}
Object.keys(LockTemplates).forEach((template) => {
  templates[template.toLowerCase()] = LockTemplates[template]
})

Object.keys(baseTemplates).forEach((template) => {
  templates[template.toLowerCase()] = baseTemplates[template]
})
export default templates
