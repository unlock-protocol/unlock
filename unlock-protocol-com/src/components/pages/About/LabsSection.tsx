interface TeamProps {
  name: string
  img: string
  imgHover?: string
  role: string
  socials?: {
    title: string
    url: string
  }[]
}

const TEAM_MEMBERS: TeamProps[] = [
  {
    name: 'Julien Genestoux',
    role: 'CEO',
    img: '/images/pages/about/julien.png',
    imgHover: '/images/pages/about/julien-hover.png',
    socials: [
      {
        title: 'Twitter',
        url: 'https://twitter.com/julien51',
      },
      {
        title: 'Linked-in',
        url: 'https://www.linkedin.com/in/juliengenestoux/',
      },
    ],
  },
  {
    name: 'Chris Carfi',
    role: 'Head of Marketing',
    img: '/images/pages/about/ccarfi.png',
    imgHover: '/images/pages/about/ccarfi-hover.png',
    socials: [
      {
        title: 'Twitter',
        url: 'https://twitter.com/ccarfi',
      },
      {
        title: 'Linked-in',
        url: 'https://www.linkedin.com/in/ccarfi/',
      },
    ],
  },
  {
    name: 'Kalidou Diagne',
    role: 'Software Engineer, Front-End',
    img: '/images/pages/about/kalidou.png',
    imgHover: '/images/pages/about/kalidou-hover.png',
    socials: [
      {
        title: 'Twitter',
        url: 'https://twitter.com/kld_diagne',
      },
      {
        title: 'Linked-in',
        url: 'https://www.linkedin.com/in/kalidou-diagne/',
      },
    ],
  },
  {
    name: 'Clément Renaud',
    role: 'Senior Software Engineer',
    img: '/images/pages/about/clement.png',
    imgHover: '/images/pages/about/clement-hover.png',
    socials: [
      {
        title: 'Twitter',
        url: 'https://twitter.com/clemsos',
      },
      {
        title: 'Linked-in',
        url: 'https://www.linkedin.com/in/clementrenaud/',
      },
    ],
  },
  {
    name: 'Searchableguy',
    role: 'Software Engineer',
    img: '/images/pages/about/searchableguy.png',
    imgHover: '/images/pages/about/searchableguy-hover.png',
    socials: [
      {
        title: 'Twitter',
        url: 'https://twitter.com/searchableguy',
      },
    ],
  },
  {
    name: 'Angela Steffens',
    role: 'Head of Developer Relations',
    img: '/images/pages/about/angela.png',
    imgHover: '/images/pages/about/angela-hover.png',
    socials: [
      {
        title: 'Twitter',
        url: 'https://twitter.com/wonderwomancode',
      },
      {
        title: 'Linked-in',
        url: 'https://www.linkedin.com/in/wonderwomancode/',
      },
    ],
  },
  {
    name: 'Patrick Workman',
    role: 'VP, Growth & Partnerships',
    img: '/images/pages/about/patrick.png',
    imgHover: '/images/pages/about/patrick-hover.png',
    socials: [
      {
        title: 'Twitter',
        url: 'https://twitter.com/PatrickWorkman',
      },
      {
        title: 'Linked-in',
        url: 'https://www.linkedin.com/in/patrickworkman/',
      },
    ],
  },
  {
    name: 'Chiali Tsai',
    role: 'Designer',
    img: '/images/pages/about/chiali.png',
    imgHover: '/images/pages/about/chiali-hover.png',
    socials: [
      {
        title: 'Twitter',
        url: 'https://twitter.com/Chia_Tea',
      },
      {
        title: 'Linked-in',
        url: 'https://www.linkedin.com/in/chialitsai/',
      },
    ],
  },
]

const TeamMember = ({ name, role, img, imgHover, socials }: TeamProps) => {
  const imageCoverWrapper =
    'absolute ease-out inset-0 object-cover overflow-hidden bg-center bg-no-repeat rounded-3xl group-hover:cursor-pointer'
  return (
    <div className="flex flex-col gap-2 md:gap-6 group">
      <div className="relative h-72">
        <div
          className={`${imageCoverWrapper} opacity-90 group-hover:opacity-0`}
          style={{
            backgroundImage: `url("${img}")`,
          }}
        ></div>
        <div
          className={`${imageCoverWrapper} opacity-0 group-hover:opacity-100`}
          style={{
            backgroundImage: `url("${imgHover || img}")`,
          }}
        ></div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-2xl font-bold text-brand-dark">{name}</span>
        <span className="text-2xl font-bold text-brand-ui-primary">{role}</span>
        <ul className="flex divide-x">
          {socials?.map(({ title, url }, index) => {
            return (
              <li key={index} className="px-2 first-of-type:pl-0">
                <a
                  className="text-gray-600 duration-200 hover:text-brand-ui-primary"
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {title}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export const LabsSection = () => {
  return (
    <div className="flex flex-col gap-8 mt-2 md:mt-16 md:gap-14">
      <span className="w-full text-xl md:w-2/3 text-brand-dark">
        The Unlock Labs team is the core team that created and currently
        maintains Unlock Protocol. Unlock Labs created Unlock Protocol to
        provide an open, shared infrastructure for memberships that removes
        friction, increases conversion, enables scale, reduces costs, and
        evolves the web from a business model built on attention toward one
        based on membership.
      </span>
      <div className="flex flex-col gap-6 mb-16">
        <h2 className="text-4xl font-bold text-uppercase text-brand-dark">
          MEET THE CORE TEAM
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-x-6 md:gap-y-10">
          {TEAM_MEMBERS?.map((member, index) => {
            return <TeamMember key={index} {...member} />
          })}
        </div>
      </div>
    </div>
  )
}
