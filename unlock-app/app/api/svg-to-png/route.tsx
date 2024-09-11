import sharp from 'sharp'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  if (!url) {
    return NextResponse.json(
      { error: 'Missing url query parameter' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch the remote SVG')
    }

    const svg = await response.text()

    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 's-maxage=86400',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Error generating PNG',
        error: error instanceof Error && error.message,
      },
      { status: 500 }
    )
  }
}
