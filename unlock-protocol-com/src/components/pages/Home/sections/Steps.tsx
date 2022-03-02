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
    <section className="px-6 py-12 mx-auto space-y-6 max-w-7xl	 sm:py-32">
      <div className="grid justify-center w-full pb-8 space-y-4 text-center">
        <h1 className="heading">How Unlock works</h1>
        <p className="text-xl sm:text-2xl text-brand-gray">
          Create your own membership program without code or chaos.
        </p>
      </div>
      <ol className="flex flex-col flex-wrap gap-8 sm:justify-center sm:flex-row">
        {UNLOCK_STEPS.map(({ title, Icon, points }, index) => (
          <li
            className="px-8 py-12 space-y-6 sm:max-w-sm glass-pane rounded-3xl"
            key={index}
          >
            <div className="flex justify-center">
              <Icon className="fill-brand-ui-primary" />
            </div>
            <div className="pt-6 space-y-4">
              <h3 className="text-2xl font-semibold sm:text-3xl">{title}</h3>
              <ol className="space-y-6">
                {points.map((text, index) => (
                  <li className="flex items-center gap-4" key={index}>
                    <div>
                      <BulletPointIcon
                        className="fill-brand-ui-primary"
                        height="12"
                        width="13"
                      />
                    </div>
                    <p className="text-lg sm:text-xl text-brand-gray">{text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
