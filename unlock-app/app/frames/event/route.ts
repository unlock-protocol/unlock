// frames.js does not yet declare Next.js 15-compatible route handler types
import { POST as _POST } from 'frames.js/next/server'

export const POST = _POST as unknown as (req: Request) => Promise<Response>
