import templates from '@unlock-protocol/email-templates'
import { PrecompiledTemplates } from '@unlock-protocol/email-templates'
import Handlebars from 'handlebars/runtime'

const TEMPLATE_METADATA_KEYS = new Set(['bases', 'embeddedImages'])

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const escaped = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return escaped[character]
  })

export class TemplateNotFoundError extends Error {
  constructor(templateName) {
    super('Missing template')
    this.name = 'TemplateNotFoundError'
    this.templateName = templateName
  }
}

const getAvailableTemplateNames = () =>
  Object.keys(PrecompiledTemplates).filter(
    (templateName) => !TEMPLATE_METADATA_KEYS.has(templateName)
  )

const getTemplateNameMap = () =>
  new Map(
    getAvailableTemplateNames().map((templateName) => [
      templateName.toLowerCase(),
      templateName,
    ])
  )

const getTemplateMetadata = (templateName) =>
  templates[templateName] || templates[templateName.toLowerCase()]

const getBaseTemplateSpec = (templateName) => {
  const originalTemplate = getTemplateMetadata(templateName)
  if (originalTemplate?.nowrap) {
    return undefined
  }
  const baseTemplateName = originalTemplate?.base || 'defaultBase'
  return PrecompiledTemplates.bases?.[baseTemplateName]
}

const withInlineImageHelper = (helper, render) => {
  const originalInlineImage = Handlebars.helpers.inlineImage
  try {
    Handlebars.registerHelper('inlineImage', helper)
    return render()
  } finally {
    if (originalInlineImage) {
      Handlebars.registerHelper('inlineImage', originalInlineImage)
    } else {
      delete Handlebars.helpers.inlineImage
    }
  }
}

const embeddedInlineImage = (filename) => {
  if (
    PrecompiledTemplates.embeddedImages &&
    PrecompiledTemplates.embeddedImages[filename]
  ) {
    return PrecompiledTemplates.embeddedImages[filename]
  }
  return `cid:${filename}`
}

const publicInlineImage = (assetBaseUrl) => (filename) => {
  if (!assetBaseUrl) {
    return embeddedInlineImage(filename)
  }
  const baseUrl = assetBaseUrl.endsWith('/') ? assetBaseUrl : `${assetBaseUrl}/`
  return new URL(encodeURIComponent(filename), baseUrl).toString()
}

const decodeBase64 = (base64Content) => {
  if (typeof atob === 'function') {
    const binaryString = atob(base64Content)
    const bytes = new Uint8Array(binaryString.length)
    for (let index = 0; index < binaryString.length; index++) {
      bytes[index] = binaryString.charCodeAt(index)
    }
    return bytes
  }

  return Uint8Array.from(Buffer.from(base64Content, 'base64'))
}

const renderHtmlWithInlineImages = (templateSpec, data, inlineImageHelper) => {
  const resolvedTemplate = templateRenderer.resolveTemplateName(templateSpec)
  const precompiledTemplate = PrecompiledTemplates[resolvedTemplate]

  return withInlineImageHelper(inlineImageHelper, () => {
    const templateFn = Handlebars.template(precompiledTemplate.html)
    const renderedContent = templateFn(data || {})
    const baseTemplateSpec = getBaseTemplateSpec(resolvedTemplate)
    if (!baseTemplateSpec) {
      return renderedContent
    }
    const baseTemplateFn = Handlebars.template(baseTemplateSpec)
    return baseTemplateFn({ content: renderedContent })
  })
}

/**
 * Template rendering functions for handling email templates
 * Provides methods to render subject lines, text content, and HTML content
 * using Handlebars templates from PrecompiledTemplates
 */
export const templateRenderer = {
  escapeHtml,

  listTemplateNames: getAvailableTemplateNames,

  resolveTemplateName: (templateName) => {
    const requestedName = String(templateName ?? '')
    const exactMatch =
      !TEMPLATE_METADATA_KEYS.has(requestedName) &&
      PrecompiledTemplates[requestedName]
    if (exactMatch) {
      return requestedName
    }

    const resolvedTemplate = getTemplateNameMap().get(
      requestedName.toLowerCase()
    )
    if (!resolvedTemplate) {
      throw new TemplateNotFoundError(templateName)
    }
    return resolvedTemplate
  },

  renderSubject: (templateSpec, data) => {
    try {
      const resolvedTemplate =
        templateRenderer.resolveTemplateName(templateSpec)
      const precompiledTemplate = PrecompiledTemplates[resolvedTemplate]
      if (!precompiledTemplate || !precompiledTemplate.subject)
        return `Email about ${resolvedTemplate}`
      const subjectFn = Handlebars.template(precompiledTemplate.subject)
      return subjectFn(data || {})
    } catch (error) {
      console.error(`Error rendering subject for ${templateSpec}:`, error)
      return `Email about ${templateSpec}`
    }
  },

  renderText: (templateSpec, data) => {
    try {
      const resolvedTemplate =
        templateRenderer.resolveTemplateName(templateSpec)
      const precompiledTemplate = PrecompiledTemplates[resolvedTemplate]
      if (!precompiledTemplate || !precompiledTemplate.text) return undefined
      const textFn = Handlebars.template(precompiledTemplate.text)
      return textFn(data || {})
    } catch (error) {
      console.error(`Error rendering text for ${templateSpec}:`, error)
      return undefined
    }
  },

  renderHtml: (templateSpec, data, options = {}) => {
    return renderHtmlWithInlineImages(
      templateSpec,
      data,
      publicInlineImage(options.assetBaseUrl)
    )
  },

  renderHtmlPreview: (templateSpec, data, options = {}) => {
    try {
      return renderHtmlWithInlineImages(
        templateSpec,
        data,
        publicInlineImage(options.assetBaseUrl)
      )
    } catch (error) {
      if (error instanceof TemplateNotFoundError) {
        return `<p>Template not found: ${escapeHtml(templateSpec)}</p>
                <p>Available templates: ${getAvailableTemplateNames()
                  .map(escapeHtml)
                  .join(', ')}</p>`
      }

      return `<p>Error rendering template: ${escapeHtml(error.message)}</p>`
    }
  },

  getTemplateMetadata: (templateSpec) => {
    const resolvedTemplate = templateRenderer.resolveTemplateName(templateSpec)
    return getTemplateMetadata(resolvedTemplate)
  },

  getTemplateAttachments: (templateSpec) => {
    const originalTemplate = templateRenderer.getTemplateMetadata(templateSpec)
    return originalTemplate?.attachments || []
  },

  getEmbeddedImage: (filename) => {
    const image = PrecompiledTemplates.embeddedImages?.[filename]
    if (!image) {
      return undefined
    }

    const match = image.match(/^data:([^;,]+);base64,(.*)$/)
    if (!match) {
      return undefined
    }

    return {
      contentType: match[1],
      body: decodeBase64(match[2]),
    }
  },

  normalizeAttachments: (attachments = []) => {
    const normalizeDataUri = (dataUri, filename) => {
      const match = dataUri.match(/^data:([^;,]+)?(?:;[^,]*)?,(.*)$/)
      if (!match) {
        return undefined
      }

      const mimeType = match[1] || 'application/octet-stream'
      const content = match[2]
      const extension = mimeType.split('/')[1] || 'bin'
      const normalizedFilename = filename
        ? filename.includes('.')
          ? filename
          : `${filename}.${extension}`
        : `attachment.${extension}`
      return {
        filename: normalizedFilename,
        content,
        mimeType,
      }
    }

    return []
      .concat(attachments || [])
      .filter(Boolean)
      .map((attachment, index) => {
        if (typeof attachment === 'object') {
          if (attachment.content) {
            return attachment
          }

          if (attachment.path) {
            return (
              normalizeDataUri(attachment.path, attachment.filename) || {
                filename: attachment.filename || `attachment-${index + 1}.txt`,
                content: attachment.path,
              }
            )
          }

          return attachment
        }

        const normalizedDataUri = normalizeDataUri(
          attachment,
          `attachment-${index + 1}`
        )
        if (!normalizedDataUri) {
          return {
            filename: `attachment-${index + 1}.txt`,
            content: attachment,
          }
        }

        return normalizedDataUri
      })
  },

  validateTemplateExists: (templateName) => {
    return templateRenderer.resolveTemplateName(templateName)
  },
}
