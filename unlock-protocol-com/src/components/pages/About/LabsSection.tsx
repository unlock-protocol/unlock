const TEAM_MEMBERS = [
  {
    name: 'Julien Genestoux',
    role: 'CEO',
    img: '/images/pages/about/julien.png',
    socials: [],
  },
  {
    name: 'Chris Carfi',
    role: 'Head of Marketing',
    img: '/images/pages/about/julien.png',
  },
  {
    name: 'Kalidou Diagne',
    role: 'Software Engineer, Front-End',
    img: '/images/pages/about/kalidou.png',
  },
  {
    name: 'Clément Renaud',
    role: 'Senior Software Engineer',
    img: '/images/pages/about/julien.png',
  },
  {
    name: 'Searchableguy',
    role: 'Software Engineer',
    img: '/images/pages/about/julien.png',
  },
  {
    name: 'Angela Steffens',
    role: 'Head of Developer Relations',
    img: '/images/pages/about/angela.png',
  },
  {
    name: 'Patrick Workman',
    role: 'VP, Growth & Partnerships',
    img: '/images/pages/about/patrick.png',
  },
  {
    name: 'Chiali Tsai',
    role: 'Designer',
    img: '/images/pages/about/chiali.png',
  },
]

interface TeamProps {
  name: string
  img: string
  role: string
  socials?: {
    title: string
    url: string
  }[]
}

const TeamMember = ({ name, role, img, socials }: TeamProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div
        className="object-cover overflow-hidden bg-center rounded-3xl h-72"
        style={{
          backgroundImage: `url("${img}")`,
        }}
      ></div>
      <div className="flex flex-col gap-2">
        <span className="text-2xl font-bold text-brand-dark">{name}</span>
        <span className="text-2xl font-bold text-brand-ui-primary">{role}</span>
        <ul className="flex divide-x">
          {socials?.map(({ title, url }, index) => {
            return (
              <li key={index} className="px-2">
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
    <div className="flex flex-col mt-16 gap-14">
      <span className="w-2/3 text-xl text-brand-dark">
        Unlock Labs created Unlock Protocol to provide an open, shared
        infrastructure for memberships that removes friction, increases
        conversion, enables scale, reduces costs, and evolves the web from a
        business model built on attention toward one based on membership.
      </span>
      <div className="flex flex-col gap-6 mb-16">
        <h2 className="text-4xl font-bold text-uppercase text-brand-dark">
          MEET THE CORE TEAM
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-10">
          {TEAM_MEMBERS?.map((member, index) => {
            return <TeamMember key={index} {...member} />
          })}
        </div>
      </div>
    </div>
  )
}
