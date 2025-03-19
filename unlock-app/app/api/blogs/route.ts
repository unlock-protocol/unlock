import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  try {
    const { data } = await axios.get('https://unlock-protocol.com/blog.rss')
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}
