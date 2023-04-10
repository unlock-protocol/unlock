import confirmEmail from './templates/confirmEmail'
import welcome from './templates/welcome'
import keyOwnership from './templates/keyOwnership'
import keyMined from './templates/keyMined'
import debug from './templates/debug'
import transferCode from './templates/transferCode'
import keyAirdropped from './templates/keyAirdropped'
import keyExpiring from './templates/keyExpiring'
import keyExpired from './templates/keyExpired'
import eventKeyMined from './templates/eventKeyMined'
import eventKeyAirdropped from './templates/eventKeyAirdropped'
import certificationKeyMined from './templates/certificationKeyMined'
import certificationKeyAirdropped from './templates/certificationKeyAirdropped'
import LockTemplates from './templates/locks'
import { base } from './templates/base/index'

export interface EmailTemplateProps {
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
  | 'keyExpiring'
  | 'keyExpired'
  | 'eventKeyMined'
  | 'eventKeyAirdropped'
  | 'certificationKeyMined'
  | 'certificationKeyAirdropped'

export const EmailTemplates: Record<Partial<Template>, EmailTemplateProps> = {
  confirmEmail,
  welcome,
  keyOwnership,
  keyMined,
  debug,
  transferCode,
  keyAirdropped,
  keyExpired,
  keyExpiring,
  eventKeyMined,
  eventKeyAirdropped,
  certificationKeyMined,
  certificationKeyAirdropped,
}

const templates: Record<string, EmailTemplateProps> = {}
Object.keys(LockTemplates).forEach((template: string) => {
  templates[template.toLowerCase()] = LockTemplates[template]
})

Object.keys(EmailTemplates).forEach((template: string) => {
  templates[template.toLowerCase()] = EmailTemplates[template as Template]
})

const getEmailTemplate = (template: Template | string) => templates[template]

export default templates
export { getEmailTemplate, base }
