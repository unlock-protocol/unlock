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
import basesRaw from './templates/base/index'
import custom from './templates/custom'
import nextAuthCode from './templates/nextAuthCode'
import eventCollectionCreated from './templates/eventCollectionCreated'
import eventApprovedInCollection from './templates/eventApprovedInCollection'
import eventDeniedInCollection from './templates/eventDeniedInCollection'
import eventSubmittedToCollectionManager from './templates/eventSubmittedToCollectionManager'
import eventSubmittedToCollectionSubmitter from './templates/eventSubmittedToCollectionSubmitter'

// Precompiled templates
import * as PrecompiledTemplates from './precompiled-templates'
import Handlebars from 'handlebars/runtime'
import { formattedCustomContent } from './templates/helpers/customContent'
import { certificationLink } from './templates/helpers/certificationLink'
import {
  eventDetails,
  eventDetailsLight,
} from './templates/helpers/eventDetails'
import { links } from './templates/helpers/links'
import { transactionLink } from './templates/helpers/transactionLink'
import { verificationCode } from './templates/helpers/verificationCode'

/* Register Handlebars helpers for runtime rendering
 * Note: These same helpers are registered in precompile.ts for build-time template compilation
 * They need to be registered here as well because precompiled templates still reference helper
 * functions by name at runtime
 */
Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)
Handlebars.registerHelper('certificationLink', certificationLink)
Handlebars.registerHelper('eventDetails', eventDetails)
Handlebars.registerHelper('eventDetailsLight', eventDetailsLight)
Handlebars.registerHelper('links', links)
Handlebars.registerHelper('transactionLink', transactionLink)
Handlebars.registerHelper('verificationCode', verificationCode)
Handlebars.registerHelper(
  'inlineImage',
  (filename: string) => `cid:${filename}`
)

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

const templates: Record<string, any> = {
  ...Object.fromEntries(
    Object.entries(LockTemplates).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ])
  ),
  ...Object.fromEntries(
    Object.entries(emailTemplates).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ])
  ),
}

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

  // Prepare runtime options for template execution
  const runtimeOptions = {
    helpers: Handlebars.helpers,
    partials: Handlebars.partials,
    data: {},
  }

  // Execute the precompiled templates
  const subject = precompiledTemplate.subject.main(data, runtimeOptions)
  const html = precompiledTemplate.html.main(data, runtimeOptions)

  const result: { subject: string; html: string; text?: string } = {
    subject,
    html,
  }

  // Add text property if available
  if (precompiledTemplate.text) {
    result.text = precompiledTemplate.text.main(data, runtimeOptions)
  }

  return result
}

const bases = basesRaw

export default templates
export { bases, PrecompiledTemplates }
