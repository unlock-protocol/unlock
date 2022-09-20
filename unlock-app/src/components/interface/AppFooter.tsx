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
      className="text-base text-white hover:underline"
      target="_blank"
      href={url}
      rel="noreferrer"
    >
      {label}
    </a>
  )
}
export const AppFooter = () => {
  return (
    <div className="py-8 bg-black ">
      <div className="flex items-center justify-between w-full mx-auto md:max-w-screen-lg lg:max-w-screen-xl">
        <img src="/images/svg/logo-monogram-square.svg" alt="logo monogram" />
        <ul className="flex gap-8">
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
