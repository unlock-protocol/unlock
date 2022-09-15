import confirmEmail from './confirmEmail'
import ejectedEmail from './ejectedEmail'
import ejectionWarningEmail from './ejectionWarningEmail'
import welcome from './welcome'
import recoveryKeyConfirmEmail from './recoveryKeyConfirmEmail'
import keyOwnership from './keyOwnership'
import keyMined from './keyMined'
import debug from './debug'

import * as LockTemplates from './locks'

const baseTemplates = {
  confirmEmail,
  ejectedEmail,
  ejectionWarningEmail,
  welcome,
  recoveryKeyConfirmEmail,
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
