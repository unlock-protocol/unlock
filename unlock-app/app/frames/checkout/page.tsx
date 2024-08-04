import { fetchMetadata } from 'frames.js/next'

export async function generateMetadata() {
  return {
    title: 'My Page',
    other: await fetchMetadata(
      new URL('/frames/checkout', 'http://localhost:3000')
    ),
  }
}

export default function Page() {
  return <span>My existing page</span>
}
