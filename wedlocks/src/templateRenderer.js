import templates from '@unlock-protocol/email-templates'
import { PrecompiledTemplates } from '@unlock-protocol/email-templates'
import Handlebars from 'handlebars/runtime'

/**
 * Template rendering functions for handling email templates
 * Provides methods to render subject lines, text content, and HTML content
 * using Handlebars templates from PrecompiledTemplates
 */
export const templateRenderer = {
  renderSubject: (templateSpec, data) => {
    try {
      const precompiledTemplate = PrecompiledTemplates[templateSpec]
      if (!precompiledTemplate || !precompiledTemplate.subject)
        return `Email about ${templateSpec}`
      const subjectFn = Handlebars.template(precompiledTemplate.subject)
      return subjectFn(data || {})
    } catch (error) {
      console.error(`Error rendering subject for ${templateSpec}:`, error)
      return `Email about ${templateSpec}`
    }
  },

  renderText: (templateSpec, data) => {
    try {
      const precompiledTemplate = PrecompiledTemplates[templateSpec]
      if (!precompiledTemplate || !precompiledTemplate.text) return undefined
      const textFn = Handlebars.template(precompiledTemplate.text)
      return textFn(data || {})
    } catch (error) {
      console.error(`Error rendering text for ${templateSpec}:`, error)
      return undefined
    }
  },

  renderHtml: (templateSpec, data) => {
    try {
      const precompiledTemplate = PrecompiledTemplates[templateSpec]
      if (!precompiledTemplate) {
        return `<p>Template not found: ${templateSpec}</p>
                <p>Available templates: ${Object.keys(PrecompiledTemplates).join(', ')}</p>`
      }
      const originalInlineImage = Handlebars.helpers.inlineImage
      let renderedContent, renderedHtml
      try {
        Handlebars.registerHelper('inlineImage', (filename) => {
          if (
            PrecompiledTemplates.embeddedImages &&
            PrecompiledTemplates.embeddedImages[filename]
          ) {
            return PrecompiledTemplates.embeddedImages[filename]
          }
          return `cid:${filename}`
        })
        const templateFn = Handlebars.template(precompiledTemplate.html)
        renderedContent = templateFn(data || {})
        const originalTemplate = templates[templateSpec]
        const baseTemplateName = originalTemplate?.base || 'defaultBase'
        const baseTemplateSpec = PrecompiledTemplates.bases[baseTemplateName]
        if (baseTemplateSpec) {
          const baseTemplateFn = Handlebars.template(baseTemplateSpec)
          renderedHtml = baseTemplateFn({ content: renderedContent })
        } else {
          renderedHtml = renderedContent
        }
      } finally {
        Handlebars.registerHelper('inlineImage', originalInlineImage)
      }
      return renderedHtml
    } catch (error) {
      return `<p>Error rendering template: ${error.message}</p>
              <p>Debug info: Template spec: ${templateSpec}, 
              Found in PrecompiledTemplates: ${!!PrecompiledTemplates[templateSpec]}</p>`
    }
  },

  validateTemplateExists: (templateName) => {
    if (!PrecompiledTemplates[templateName]) {
      throw new Error(
        `Template "${templateName}" not found in precompiled templates`
      )
    }
  },
}
