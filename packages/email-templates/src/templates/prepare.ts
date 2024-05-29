import Handlebars from 'handlebars'
import { readFileSync } from 'fs'
import { join } from 'path'

export const prepareAll = (template: any, opts = {}) => {
  const prepared = { attachments: [], ...template }
  Object.keys(template).forEach((format) => {
    if (['html', 'text', 'subject'].indexOf(format) > -1) {
      const { compiledTemplate, getImages } = prepareTemplate(
        template[format],
        opts
      )

      prepared[format] = (args: any) => {
        const content = compiledTemplate(args)
        const images = getImages()
        if (Array.isArray(images)) {
          images?.forEach((image) => {
            prepared.attachments.push(image)
          })
        }
        return content
      }
    }
  })
  return prepared
}

interface TemplateImage {
  filename: string
  path: string
  cid: string
}

interface PrepareOptions {
  context?: 'web' | 'email'
}

export const prepareTemplate = (content: string, opts: PrepareOptions = {}) => {
  const images: TemplateImage[] = []
  Handlebars.registerHelper('inlineImage', function (filename) {
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

  return {
    compiledTemplate: Handlebars.compile(content),
    getImages: function () {
      return images
    },
  }
}
