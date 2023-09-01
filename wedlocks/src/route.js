import nodemailer from 'nodemailer'
import config from '../config'
import encrypter from './encrypter'
import wrap from './wrap'
import templates from '@unlock-protocol/email-templates'

import { prepareAll } from './templates/prepare'

/**
 * Builds the template and params
 * @param {*} args
 * @returns
 */
const getTemplateAndParams = async (args, opts) => {
  let template = templates[args.template.toLowerCase()]

  if (!template && args.failoverTemplate) {
    template = templates[args.failoverTemplate.toLowerCase()]
  }

  if (!template) {
    throw new Error('Missing template')
  }

  // Extract images... etc
  template = prepareAll(template, opts)

  const templateParams = {}
  Object.keys(args.params).forEach((key) => {
    const param = args.params[key]
    if (typeof param === 'object' && param.encrypt) {
      templateParams[key] = encrypter.signParam(param.value)
    } else {
      templateParams[key] = param
    }
  })

  if (template.nowrap) {
    return [template, templateParams]
  }

  // Wrap the template
  return [await wrap(template, opts), templateParams]
}

const buildEmail = async (template, templateParams, args) => {
  return {
    from: {
      name: args?.emailSender || 'Unlock Labs',
      address: config.sender,
    },
    to: args.recipient,
    replyTo: args?.replyTo || undefined,
    subject: await template.subject(templateParams),
    text: template.text ? await template.text(templateParams) : undefined,
    html: template.html ? await template.html(templateParams) : undefined,
    attachments: []
      .concat(args.attachments, template.attachments)
      .filter((x) => !!x),
  }
}

// This function loads the template and performs the actual email sending
// args: {
//  template: templateName string
//  failoverTemplate: failoverTemplate string
//  recipient: email address string
//  params: params for the template (as a hash). Each param is key: value where value can be either a string, or an object with {sign: <boolean></boolean>, value: <string>}
//  attachments: array of attachements as data-uri strings (nodemailer will handle them)
// }
export const route = async (args) => {
  // Wrap the template
  const [template, templateParams] = await getTemplateAndParams(args)
  const transporter = nodemailer.createTransport(config)
  return transporter.sendMail(await buildEmail(template, templateParams, args))
}

/**
 * Preview the template
 * @param {*} args
 * @returns
 */
export const preview = async (args) => {
  const [template, templateParams] = await getTemplateAndParams(args, {
    context: 'web',
  })

  Object.keys(args.params).forEach((key) => {
    const param = args.params[key]
    if (typeof param === 'object' && param.encrypt) {
      templateParams[key] = encrypter.signParam(param.value)
    } else {
      templateParams[key] = param
    }
  })
  if (!args.json) {
    return template.html(templateParams)
  }
  return JSON.stringify(await buildEmail(template, templateParams, args))
}

export default {
  route,
}
