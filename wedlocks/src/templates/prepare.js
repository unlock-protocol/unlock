import handlebars from 'handlebars'
import { readFileSync } from 'fs'
import { join } from 'path'

export const prepareAll = (template, opts = {}) => {
  const prepared = { attachments: [], ...template }
  Object.keys(template).forEach((format) => {
    if (['html', 'text', 'subject'].indexOf(format) > -1) {
      const [compiled, getImages] = prepare(template[format], opts)

      prepared[format] = (args) => {
        const content = compiled(args)
        const images = getImages()
        images?.forEach((image) => {
          prepared.attachments.push(image)
        })
        return content
      }
    }
  })
  return prepared
}

export const prepare = (content, opts = {}) => {
  const images = []
  handlebars.registerHelper('inlineImage', function (filename) {
    const path = join(__dirname, `/../../../static/attachments/${filename}`)

    if (opts?.context === 'web') {
      // Read file as base64, serve1
      return `data:image/png;base64,${readFileSync(path, 'base64')}`
    } else {
      images.push({
        filename,
        path,
        cid: filename, //same cid value as in the html img src
      })
      return `cid:${filename}`
    }
  })

  const template = handlebars.compile(content)
  return [template, () => images]
}

export default prepare
