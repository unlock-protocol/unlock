'use client'
import { EMAIL_SUBSCRIPTION_FORM } from '~/constants'
import { config } from '~/config/app'
import { Footer } from '@unlock-protocol/ui'
import { useTranslations } from '~/contexts/LanguageContext'

const submitEmailSubscription = async (email: string) => {
  const { portalId, formGuid } = EMAIL_SUBSCRIPTION_FORM
  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: [
        {
          name: 'email',
          value: email,
        },
      ],
    }),
  }

  await fetch(endpoint, options)
}

export default function DashboardFooter() {
  const t = useTranslations('footer')

  const footer = {
    subscriptionForm: {
      title: t('updatesTitle'),
      description: t('updatesDescription'),
      onSubmit: submitEmailSubscription,
    },
    logo: {
      url: config.unlockStaticUrl,
    },
    privacyUrl: `${config.unlockStaticUrl}/privacy`,
    termsUrl: `${config.unlockStaticUrl}/terms`,
    menuSections: [
      {
        title: t('about'),
        options: [
          { label: t('aboutUnlock'), url: `${config.unlockStaticUrl}/about` },
          {
            label: t('roadmap'),
            url: 'https://docs.unlock-protocol.com/governance/roadmap/',
          },
        ],
      },
      {
        title: t('governance'),
        options: [
          {
            label: t('unlockDao'),
            url: 'https://unlock-protocol.com/blog/unlock-dao',
          },
          { label: t('forum'), url: 'https://unlock.community/' },
          {
            label: t('snapshot'),
            url: 'https://snapshot.org/#/unlock-protocol.eth',
          },
        ],
      },
      {
        title: t('community'),
        options: [
          {
            label: t('showcase'),
            url: 'https://showcase.unlock-protocol.com/',
          },
          { label: t('blog'), url: `${config.unlockStaticUrl}/blog` },
          {
            label: t('events'),
            url: `${config.unlockStaticUrl}/upcoming-events`,
          },
          { label: t('grants'), url: `${config.unlockStaticUrl}/grants` },
        ],
      },
      {
        title: t('resources'),
        options: [
          { label: t('docs'), url: 'https://docs.unlock-protocol.com/' },
          {
            label: t('developers'),
            url: `${config.unlockStaticUrl}/developers`,
          },
          { label: t('guides'), url: `${config.unlockStaticUrl}/blog` },
          {
            label: t('integrations'),
            url: 'https://docs.unlock-protocol.com/move-to-guides/plugins-and-integrations/',
          },
          {
            label: t('mediaKit'),
            url: 'https://unlockprotocol.notion.site/Press-Kit-35836bdcc88f400eb5bb429c477c3333',
          },
        ],
      },
    ],
  }

  return <Footer {...footer} />
}
