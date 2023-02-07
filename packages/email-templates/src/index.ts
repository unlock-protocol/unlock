import confirmEmail from './templates/confirmEmail'
import welcome from './templates/welcome'
import keyOwnership from './templates/keyOwnership'
import keyMined from './templates/keyMined'
import debug from './templates/debug'
import transferCode from './templates/transferCode'
import keyAirdropped from './templates/keyAirdropped'
import LockTemplates from './templates/locks'

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
  ...LockTemplates,
}

export const getEmailTemplate = (template: Template) => EmailTemplates[template]
