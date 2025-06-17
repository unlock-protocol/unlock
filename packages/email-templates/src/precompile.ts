import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'

// Registering Handlebars helpers
import { formattedCustomContent } from './templates/helpers/customContent'
import { certificationLink } from './templates/helpers/certificationLink'
import {
  eventDetails,
  eventDetailsLight,
} from './templates/helpers/eventDetails'
import { links } from './templates/helpers/links'
import { transactionLink } from './templates/helpers/transactionLink'
import { verificationCode } from './templates/helpers/verificationCode'
import defaultBase from './templates/base/default'
import eventsBase from './templates/base/events'

// Map of image files to their base64 representations
const imageMap: Record<string, string> = {}

// Load embedded images
const attachmentsDir = path.resolve(
  __dirname,
  '../../../wedlocks/static/attachments'
)
if (fs.existsSync(attachmentsDir)) {
  const imageFiles = fs
    .readdirSync(attachmentsDir)
    .filter((file) => /\.(png|jpg|gif)$/.test(file))
  imageFiles.forEach((file) => {
    try {
      const imagePath = path.join(attachmentsDir, file)
      const imageBuffer = fs.readFileSync(imagePath)
      const extension = path.extname(file).substring(1)
      const base64Image = imageBuffer.toString('base64')
      imageMap[file] = `data:image/${extension};base64,${base64Image}`
      console.log(`✅ Embedded image: ${file}`)
    } catch (error) {
      console.error(`Error embedding image ${file}:`, error)
    }
  })
}

// Register Handlebars helpers using a loop
const helpers = [
  { name: 'formattedCustomContent', fn: formattedCustomContent },
  { name: 'certificationLink', fn: certificationLink },
  { name: 'eventDetails', fn: eventDetails },
  { name: 'eventDetailsLight', fn: eventDetailsLight },
  { name: 'links', fn: links },
  { name: 'transactionLink', fn: transactionLink },
  { name: 'verificationCode', fn: verificationCode },
  { name: 'inlineImage', fn: (filename: string) => `cid:${filename}` },
]
helpers.forEach(({ name, fn }) => Handlebars.registerHelper(name, fn))

const templatesDir = path.resolve(__dirname, 'templates')
const outputFile = path.resolve(__dirname, 'precompiled-templates.ts')

const header = `// @ts-nocheck - This file is generated at build time

export type TemplateSpec = any; // Type for precompiled template specs

export interface TemplateCollection {
  subject?: TemplateSpec;
  html?: TemplateSpec;
  text?: TemplateSpec;
}

// Embedded base64 images for preview
export const embeddedImages = ${JSON.stringify(imageMap)};

// Precompiled base templates
export const bases = {
  defaultBase: ${Handlebars.precompile(defaultBase)},
  events: ${Handlebars.precompile(eventsBase)}
};

`

const compileTemplateFromFile = (filePath: string, name: string): string => {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  let output = `export const ${name}: TemplateCollection = {\n`
  const fields = [
    { key: 'subject', regex: /subject:\s+['"`]+([\s\S]+?)['"`]+,/ },
    { key: 'html', regex: /html:\s+`([\s\S]+?)`/ },
    { key: 'text', regex: /text:\s+`([\s\S]+?)`/ },
  ]
  fields.forEach(({ key, regex }) => {
    const match = fileContent.match(regex)
    if (match && match[1]) {
      const precompiled = Handlebars.precompile(match[1])
      output += `  ${key}: ${precompiled},\n`
    }
  })
  output += '};\n\n'
  return output
}

let templatesOutput = ''
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
    templatesOutput += compileTemplateFromFile(templatePath, name)
  } catch (error) {
    console.error(`Error processing template ${file}:`, error)
  }
})

const finalOutput = header + templatesOutput
fs.writeFileSync(outputFile, finalOutput)
console.log('✅ Precompiled templates saved to', outputFile)
