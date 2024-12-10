import axios from 'axios'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import { useEffect } from 'react'
dayjs.extend(isToday)

interface Blog {
  title: string
  link: string
  id: string
  updated: string
  content: string
  viewed: boolean
}

export function LatestBlogsLink({
  setModalOpen,
}: {
  setModalOpen: (modalOpen: boolean) => void
}) {
  useEffect(() => {
    saveLatestBlogs('https://unlock-protocol.com/blog.rss')
  }, [])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-1 cursor-pointer" onClick={handleClick}>
      <div className="font-medium">Show Latest Blogs</div>
      <div className="text-sm text-gray-500">
        Check out the latest updates from our blog.
      </div>
    </div>
  )
}

export const LatestBlogs = () => {
  const blogs: Blog[] = getLatestBlogs()

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Latest Blogs</h2>
      <div className="space-y-4 max-h-[80vh] overflow-y-scroll">
        {!blogs || blogs.length === 0 ? (
          <div className="text-sm text-gray-600">No blogs available.</div>
        ) : (
          blogs.map(
            (blog, i) =>
              !blog.viewed && (
                <a
                  key={i}
                  href={blog.link}
                  target="_blank"
                  onClick={() => updateBlog(blog.id)}
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="text-base font-semibold text-gray-800">
                      {blog.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated: {dayjs(blog.updated).format('MMM DD, YYYY')}
                    </div>
                    <div className="text-sm text-blue-600 hover:underline mt-2">
                      Read more →
                    </div>
                  </div>
                </a>
              )
          )
        )}
      </div>
    </div>
  )
}

async function parseAtomFeed(url: string) {
  const response = await axios.get(url)
  const text = response?.data

  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'application/xml')

  if (doc.querySelector('parsererror')) {
    throw new Error('Error parsing Atom feed.')
  }

  const atomNS = 'http://www.w3.org/2005/Atom'
  const entries = doc.getElementsByTagNameNS(atomNS, 'entry')

  const storedData = localStorage.getItem('latest_blogs')
  let storedDate: string | undefined
  let viewedMap = new Map<string, boolean>()
  if (storedData) {
    const parsed = JSON.parse(storedData)
    storedDate = parsed.fetched_on
    viewedMap = new Map(parsed.blogs.map((b) => [b.id, b.viewed]))
  }

  const unreadItems: Blog[] = []
  for (const entry of Array.from(entries)) {
    const id =
      entry.getElementsByTagNameNS(atomNS, 'id')[0]?.textContent.trim() || ''
    const title =
      entry.getElementsByTagNameNS(atomNS, 'title')[0]?.textContent.trim() || ''
    const linkElement = entry.getElementsByTagNameNS(atomNS, 'link')[0]
    const link = linkElement?.getAttribute('href')?.trim() || ''
    const updated =
      entry.getElementsByTagNameNS(atomNS, 'updated')[0]?.textContent.trim() ||
      ''
    const content =
      entry.getElementsByTagNameNS(atomNS, 'content')[0]?.textContent.trim() ||
      ''

    const viewed = viewedMap.has(id) ? viewedMap.get(id)! : false
    if (!viewed) {
      unreadItems.push({ title, link, id, updated, content, viewed: false })
      if (unreadItems.length === 10) break
    }
  }

  return {
    entries: unreadItems,
  }
}

export async function saveLatestBlogs(url: string) {
  const storedDate =
    localStorage.getItem('latest_blogs') &&
    JSON.parse(localStorage.getItem('latest_blogs')!).fetched_on
  if (storedDate && dayjs(storedDate).isToday()) {
    return
  }

  const { entries } = await parseAtomFeed(url)
  localStorage.setItem(
    'latest_blogs',
    JSON.stringify({ blogs: entries, fetched_on: new Date().toISOString() })
  )
}

function getLatestBlogs() {
  const storedData = localStorage.getItem('latest_blogs')
  if (!storedData) {
    return null
  }

  const parsed = JSON.parse(storedData)
  return parsed.blogs
}

function updateBlog(blogId: string) {
  const storedData = localStorage.getItem('latest_blogs')
  if (!storedData) return

  const parsed = JSON.parse(storedData)
  const updatedBlogs = parsed.blogs.map((b: Blog) => {
    if (b.id === blogId) {
      return { ...b, viewed: true }
    }
    return b
  })

  localStorage.setItem(
    'latest_blogs',
    JSON.stringify({
      blogs: updatedBlogs,
      fetched_on: parsed.fetched_on,
    })
  )
}
