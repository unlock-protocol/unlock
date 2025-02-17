import axios from 'axios'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
dayjs.extend(isToday)

export interface Blog {
  title: string
  link: string
  id: string
  updated: string
  viewed: boolean
}

export function BlogLink({
  setBlogs,
  blog,
}: {
  setBlogs: (blogs: Blog[]) => void
  blog: Blog
}) {
  return (
    <a
      href={blog.link}
      target="_blank"
      onClick={() => updateBlog(blog.id, setBlogs)}
      rel="noopener noreferrer"
      className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex flex-col space-y-4">
        <div
          className={`text-base font-semibold ${blog.viewed ? 'text-gray-400' : 'text-black'}`}
        >
          {blog.title}
        </div>
        <div className="text-xs text-gray-500">
          {dayjs(blog.updated).format('MMM DD, YYYY')}
        </div>
      </div>
    </a>
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
  const entries = Array.from(doc.getElementsByTagNameNS(atomNS, 'entry'))

  let viewedMap = new Map<string, boolean>()
  const storedData = localStorage.getItem('latest_blogs')
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData)
      if (Array.isArray(parsed.blogs)) {
        viewedMap = new Map(parsed.blogs.map((b: any) => [b.id, b.viewed]))
      }
    } catch (error) {
      console.error('Error parsing stored latest_blogs', error)
    }
  }

  const blogs: Blog[] = entries.map((entry) => {
    const id =
      entry.getElementsByTagNameNS(atomNS, 'id')[0]?.textContent?.trim() || ''
    const title =
      entry.getElementsByTagNameNS(atomNS, 'title')[0]?.textContent?.trim() ||
      ''
    const linkElement = entry.getElementsByTagNameNS(atomNS, 'link')[0]
    const link = linkElement?.getAttribute('href')?.trim() || ''
    const updated =
      entry.getElementsByTagNameNS(atomNS, 'updated')[0]?.textContent?.trim() ||
      ''
    const viewed = viewedMap.has(id) ? viewedMap.get(id)! : false

    return { title, link, id, updated, viewed }
  })

  const limitedBlogs = blogs.slice(0, 5)
  return { entries: limitedBlogs }
}

export async function saveLatestBlogs(
  url: string,
  setBlogs: (blogs: Blog[]) => void
) {
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
  setBlogs(entries)
}

function updateBlog(blogId: string, setBlogs: (blogs: Blog[]) => void) {
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
  setBlogs(updatedBlogs)
}
