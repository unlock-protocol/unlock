import confirmEmail from './templates/confirmEmail'
import welcome from './templates/welcome'
import keyOwnership from './templates/keyOwnership'
import keyMined from './templates/keyMined'
import debug from './templates/debug'
import transferCode from './templates/transferCode'
import keyAirdropped from './templates/keyAirdropped'
import LockTemplates from './templates/locks'
import base from './templates/base'

interface EmailTemplateProps {
  nowrap?: boolean
  subject: string
  html: string
}

type Template =
  | 'debug'
  | 'welcome'
  | 'confirmEmail'
  | 'keyMined'
  | 'keyAirdropped'
  | 'keyOwnership'
  | 'transferCode'

export const EmailTemplates: Record<Partial<Template>, EmailTemplateProps> = {
  confirmEmail,
  welcome,
  keyOwnership,
  keyMined,
  debug,
  transferCode,
  keyAirdropped,
}

const templates = {}
Object.keys(LockTemplates).forEach((template: any) => {
  // @ts-ignore
  templates[template.toLowerCase()] = LockTemplates[template]
})

Object.keys(EmailTemplates).forEach((template: string) => {
  // @ts-ignore
  templates[template.toLowerCase()] = EmailTemplates[template]
})

const getEmailTemplate = (template: Template) => EmailTemplates[template]
// @ts-ignore
const getLockTemplate = (template: any) => LockTemplates[template]

export default templates
export { base, getEmailTemplate, getLockTemplate }
