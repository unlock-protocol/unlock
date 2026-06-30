import { handler } from './functions/handler/handler'
import { templateRenderer } from './templateRenderer'

export interface Env {
  SMTP_HOST: string
  SMTP_PORT: string | number
  SMTP_USERNAME: string
  SMTP_PASSWORD: string
  SMTP_FROM_ADDRESS?: string
}

interface HandlerResponse {
  statusCode: number
  body?: string
  headers?: Record<string, string>
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const imageMatch = url.pathname.match(/^\/__wedlocks\/images\/([^/]+)$/)
    if (imageMatch) {
      const image = templateRenderer.getEmbeddedImage(
        decodeURIComponent(imageMatch[1])
      )
      if (!image) {
        return new Response('Not Found', { status: 404 })
      }

      return new Response(image.body, {
        headers: {
          'Content-Type': image.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    const body = await request.text()

    const headers: Record<string, string> = {}
    for (const pair of request.headers.entries()) {
      headers[pair[0]] = pair[1]
    }

    return handler(
      {
        httpMethod: request.method,
        headers,
        body,
        path: url.pathname,
        rawUrl: request.url,
        queryStringParameters: Object.fromEntries(url.searchParams.entries()),
      },
      env,
      (error: Error | null, response: HandlerResponse) => {
        if (error) {
          return new Response(error.message, {
            status: 500,
            headers: {},
          })
        }

        // For 204 responses, body must be null
        if (response.statusCode === 204) {
          return new Response(null, {
            status: response.statusCode,
            headers: response.headers,
          })
        }

        return new Response(response.body, {
          status: response.statusCode,
          headers: response.headers,
        })
      }
    )
  },
}
