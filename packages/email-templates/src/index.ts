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
import eventRsvpSubmitted from './templates/eventRsvpSubmitted'
import eventKeyAirdropped from './templates/eventKeyAirdropped'
import certificationKeyMined from './templates/certificationKeyMined'
import certificationKeyAirdropped from './templates/certificationKeyAirdropped'
import inviteEvent from './templates/inviteEvent'
import eventDeployed from './templates/eventDeployed'
import LockTemplates from './templates/locks'
import bases from './templates/base/index'
import custom from './templates/custom'
import nextAuthCode from './templates/nextAuthCode'
import eventCollectionCreated from './templates/eventCollectionCreated'
import eventApprovedInCollection from './templates/eventApprovedInCollection'
import eventDeniedInCollection from './templates/eventDeniedInCollection'
import eventSubmittedToCollectionManager from './templates/eventSubmittedToCollectionManager'
import eventSubmittedToCollectionSubmitter from './templates/eventSubmittedToCollectionSubmitter'
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
  | 'inviteEvent'
  | 'eventDeployed'
  | 'eventKeyMined'
  | 'eventRsvpSubmitted'
  | 'eventKeyAirdropped'
  | 'certificationKeyMined'
  | 'certificationKeyAirdropped'
  | 'custom'
  | 'nextAuthCode'
  | 'eventCollectionCreated'
  | 'eventApprovedInCollection'
  | 'eventDeniedInCollection'
  | 'eventSubmittedToCollectionManager'
  | 'eventSubmittedToCollectionSubmitter'

export const EmailTemplates: Record<string, EmailTemplateProps> = {
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
  eventRsvpSubmitted,
  eventKeyAirdropped,
  certificationKeyMined,
  certificationKeyAirdropped,
  custom,
  inviteEvent,
  eventDeployed,
  nextAuthCode,
  eventCollectionCreated,
  eventApprovedInCollection,
  eventDeniedInCollection,
  eventSubmittedToCollectionManager,
  eventSubmittedToCollectionSubmitter,
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
export { getEmailTemplate, bases }
