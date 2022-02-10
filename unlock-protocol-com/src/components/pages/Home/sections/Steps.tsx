import {
  KeyIcon,
  LockIcon,
  LockWebIcon,
  BulletPointIcon,
} from '../../../icons/Util'

const UNLOCK_STEPS = [
  {
    Icon: LockIcon,
    title: 'Define your own membership terms',
    points: [
      'Set your membership parameters without code!',
      'Add original artwork to your membership NFTs',
    ],
  },

  {
    Icon: LockWebIcon,
    title: 'Launch your membership',
    points: [
      'Craft your content on your platforms of choice',
      'Set up your members-only content',
    ],
  },

  {
    Icon: KeyIcon,
    title: 'Members can purchase NFT keys',
    points: [
      'Members get exclusive experiences',
      'NFT-based keys provide access to unique content',
    ],
  },
]

export function Steps() {
  return (
    <div className="space-y-8">
      <div className="grid justify-center w-full space-y-4 text-center">
        <h2 className="text-4xl font-bold sm:text-5xl"> How Unlock works </h2>
        <p className="text-lg sm:text-xl text-brand-gray">
          Create your own membership program without code or chaos.
        </p>
      </div>
      <ol className="flex gap-6">
        {UNLOCK_STEPS.map(({ title, Icon, points }, index) => (
          <li
            className="grid gap-4 p-8 bg-shadow-and-glass rounded-3xl"
            key={index}
          >
            <div className="flex justify-center">
              <Icon className="fill-brand-ui-primary" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold sm:text-2xl">{title}</h3>
              <ol className="space-y-2">
                {points.map((text, index) => (
                  <li className="flex items-center gap-4" key={index}>
                    <div>
                      <BulletPointIcon
                        className="fill-brand-ui-primary"
                        height="12"
                        width="13"
                      />
                    </div>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
