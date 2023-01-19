import confirmEmail from './confirmEmail'
import welcome from './welcome'
import keyOwnership from './keyOwnership'
import keyMined from './keyMined'
import debug from './debug'
import transferCode from './transferCode'
import keyAirdropped from './keyAirdropped'
import LockTemplates from './locks'

const baseTemplates = {
  confirmEmail,
  welcome,
  keyOwnership,
  keyAirdropped,
  keyMined,
  transferCode,
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
