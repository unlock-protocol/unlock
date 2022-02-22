import html from 'html-template-tag'
import { Request, Response } from 'express'
import { networks } from '@unlock-protocol/networks'

interface Link {
  href: string
  rel: string
}

interface HubPublisherTemplateOptions {
  links: Link[]
}

export class HubPublisherController {
  handle(
    request: Request<{ lock?: string; network: string }>,
    response: Response
  ) {
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

    return response.send(this.template({ links }))
  }

  template({ links }: HubPublisherTemplateOptions) {
    const htmlResponse = `
        <!DOCTYPE html>
        <html>
          <head>
            ${links
              .map(
                (item) => html`<link rel="${item.rel}" href="${item.href}" />`
              )
              .join('')}
          </head>
          <body>
             To subscribe to our topic, make a POST request to this endpoint with valid hub payload. Links are included in the header and head of the responses as per the <a href="https://www.w3.org/TR/websub/"> websub </a> w3 spec.
          </body>
        </html>
      `

    return htmlResponse
  }
}
