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

// Precompiled templates
import * as PrecompiledTemplates from './precompiled-templates'

const emailTemplates = {
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

const templates: Record<string, any> = Object.assign(
  {},
  ...[LockTemplates, emailTemplates].map((obj: Record<string, any>) => {
    return Object.keys(obj).reduce(
      (acc, key) => {
        acc[key.toLowerCase()] = obj[key]
        return acc
      },
      {} as Record<string, any>
    )
  })
)

export const getEmailTemplate = (template: string): any =>
  templates[template.toLowerCase()]

export interface EmailTemplateProps {
  nowrap?: boolean
  subject: string
  html: string
}

export const renderPrecompiledTemplate = (templateName: string, data: any) => {
  const precompiledTemplate = (PrecompiledTemplates as any)[templateName]
  if (!precompiledTemplate) {
    throw new Error(
      `Template ${templateName} not found in precompiled templates`
    )
  }
  return {
    subject:
      typeof precompiledTemplate.subject === 'function'
        ? precompiledTemplate.subject(data)
        : precompiledTemplate.subject,
    html:
      typeof precompiledTemplate.html === 'function'
        ? precompiledTemplate.html(data)
        : precompiledTemplate.html,
    ...(precompiledTemplate.text
      ? {
          text:
            typeof precompiledTemplate.text === 'function'
              ? precompiledTemplate.text(data)
              : precompiledTemplate.text,
        }
      : {}),
  }
}

export default templates
export { bases, PrecompiledTemplates }
