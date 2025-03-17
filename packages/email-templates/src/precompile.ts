import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'

// Registering Handlebars helpers used in templates
import { formattedCustomContent } from './templates/helpers/customContent'
import { certificationLink } from './templates/helpers/certificationLink'
import {
  eventDetails,
  eventDetailsLight,
} from './templates/helpers/eventDetails'
import { links } from './templates/helpers/links'
import { transactionLink } from './templates/helpers/transactionLink'
import { verificationCode } from './templates/helpers/verificationCode'

// Registering all helpers
Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)
Handlebars.registerHelper('certificationLink', certificationLink)
Handlebars.registerHelper('eventDetails', eventDetails)
Handlebars.registerHelper('eventDetailsLight', eventDetailsLight)
Handlebars.registerHelper('links', links)
Handlebars.registerHelper('transactionLink', transactionLink)
Handlebars.registerHelper('verificationCode', verificationCode)
Handlebars.registerHelper('inlineImage', function (filename) {
  return `cid:${filename}`
})

const templatesDir = path.resolve(__dirname, 'templates')
const outputFile = path.resolve(__dirname, 'precompiled-templates.ts')

const header = `// @ts-nocheck - This file is generated at build time
import * as Handlebars from "handlebars";
// Importing helpers
import { formattedCustomContent } from './templates/helpers/customContent'
import { certificationLink } from './templates/helpers/certificationLink'
import { eventDetails, eventDetailsLight } from './templates/helpers/eventDetails'
import { links } from './templates/helpers/links'
import { transactionLink } from './templates/helpers/transactionLink'
import { verificationCode } from './templates/helpers/verificationCode'

// Registering all helpers
Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)
Handlebars.registerHelper('certificationLink', certificationLink)
Handlebars.registerHelper('eventDetails', eventDetails)
Handlebars.registerHelper('eventDetailsLight', eventDetailsLight)
Handlebars.registerHelper('links', links)
Handlebars.registerHelper('transactionLink', transactionLink)
Handlebars.registerHelper('verificationCode', verificationCode)
Handlebars.registerHelper('inlineImage', function (filename) {
  return \`cid:\${filename}\`
});

`

let output = header

const templateFiles = fs
  .readdirSync(templatesDir)
  .filter(
    (file) =>
      file.endsWith('.ts') &&
      !file.includes('prepare') &&
      !file.includes('helpers') &&
      !file.startsWith('index')
  )

templateFiles.forEach((file) => {
  const name = file.replace('.ts', '')
  const templatePath = path.resolve(templatesDir, file)
  try {
    const templateModule = require(templatePath)
    const template = templateModule.default
    if (template) {
      const fileContent = fs.readFileSync(templatePath, 'utf-8')
      output += `export const ${name} = {\n`
      const fields = [
        { key: 'subject', regex: /subject:\s+['"`"]([\s\S]+?)['"`"],/ },
        { key: 'html', regex: /html:\s+`([\s\S]+?)`/ },
        { key: 'text', regex: /text:\s+`([\s\S]+?)`/ },
      ]
      fields.forEach(({ key, regex }) => {
        if (template[key]) {
          const match = fileContent.match(regex)
          if (match && match[1]) {
            const precompiled = Handlebars.precompile(match[1])
            output += `  ${key}: Handlebars.template(${precompiled}),\n`
          }
        }
      })
      output += `};\n\n`
    }
  } catch (error) {
    console.error(`Error processing template ${file}:`, error)
  }
})

fs.writeFileSync(outputFile, output)
console.log('✅ Precompiled templates saved to', outputFile)
