import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'

const templatesDir = path.resolve(__dirname, '../src/templates')
const outputFile = path.resolve(__dirname, '../src/precompiled-templates.ts')

let output = `import * as Handlebars from "handlebars";\n\n`

fs.readdirSync(templatesDir).forEach((file) => {
  if (file.endsWith('.ts')) {
    const name = file.replace('.ts', '')
    const content = require(path.resolve(templatesDir, file)).default
    if (content) {
      // const precompiled = Handlebars.precompile(content)
      output += `export const ${name} = {`
      // Handlebars.template(${precompiled});\n`
      Object.keys(content).forEach((key) => {
        output += `\n  ${key}: Handlebars.template(${Handlebars.precompile(content[key])}),`
      })
      output += `};\n`
    }
  }
})

fs.writeFileSync(outputFile, output)
console.log('✅ Precompiled templates saved to', outputFile)
