import html from 'html-template-tag'
import { RequestHandler } from 'express'
import { networks } from '@unlock-protocol/networks'

interface Link {
  href: string
  rel: string
}

interface HubPublisherTemplateOptions {
  links: Link[]
}

export const template = ({ links }: HubPublisherTemplateOptions) => {
  const htmlResponse = `
        <!DOCTYPE html>
        <html>
          <head>
            ${links
              .map(
                (item) => html`<link rel="${item.rel}" href="${item.href}" />`
              )
              .join('\n')}
          </head>
          <body>
            <p>Hub publisher for Unlock</p>
          </body>
        </html>
      `
  return htmlResponse
}

export const handlePublisher: RequestHandler<{
  lock?: string
  network: string
}> = (request, response) => {
  const network = networks[request.params.network]
  if (!network) {
    return response.status(404).send('Unsupported network')
  }

  const url = new URL(
    request.originalUrl,
    `${request.protocol}://${request.hostname}`
  )

  const links = [
    {
      rel: 'self',
      href: url.toString(),
    },
    {
      rel: 'hub',
      href: url.toString(),
    },
  ]

  response.setHeader(
    'Link',
    links.map((item) => `<${item.href}>; rel="${item.rel}"`)
  )

  return response.send(template({ links }))
}
