interface Link {
  label: string
  url: string
}

const links: Link[] = [
  { label: 'Doc', url: 'https://docs.unlock-protocol.com/' },
  { label: 'Guides', url: 'https://unlock-protocol.com/guides/' },
  { label: 'Github', url: 'https://github.com/unlock-protocol/unlock' },
  { label: 'Discord', url: 'https://discord.com/invite/Ah6ZEJyTDp' },
]

const Link = ({ label, url }: Link) => {
  return (
    <a
      className="text-base font-bold text-white hover:underline"
      target="_blank"
      href={url}
      rel="noreferrer"
    >
      {label}
    </a>
  )
}
export const AppFooter = ({ sticky = false }) => {
  return (
    <div
      className={`px-4 py-8 bg-black md:px-0 ${
        sticky ? 'sticky bottom-0' : ''
      }`}
    >
      <div className="flex flex-col items-start w-full gap-10 md:gap-0 md:mx-auto md:justify-between md:items-center md:flex-row md:max-w-screen-lg lg:max-w-screen-xl">
        <a href="/">
          <img
            className="h-6"
            src="/images/svg/logo-monogram-square.svg"
            alt="logo monogram"
          />
        </a>
        <ul className="flex flex-col gap-8 md:px-0 md:flex-row">
          {links?.map((link, index) => {
            return (
              <li key={index}>
                <Link {...link}></Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
