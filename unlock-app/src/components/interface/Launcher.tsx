import Link from 'next/link'

export const Launcher = () => {
  return (
    <div>
      <p>What do you want to do today?</p>
      <ul>
        <li>
          <Link href="/event/new">Create a new event</Link>
        </li>
        <li>
          <Link href="/certification/new">Create a new certification</Link>
        </li>
        <li>
          <Link href="/locks/create">Create a custom membership contract</Link>
        </li>
      </ul>
    </div>
  )
}
