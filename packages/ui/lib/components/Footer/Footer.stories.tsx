import Footer from './Footer'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: Footer,
  title: 'Footer',
} as ComponentMeta<typeof Footer>

const Template: ComponentStory<typeof Footer> = (args) => <Footer {...args} />

export const Normal = Template.bind({})

Normal.args = {
  subscriptionForm: {
    // example of implementation when form is submitted
    onSubmit: async (email: string) => {
      const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/19942922/868101be-ae3e-422e-bc86-356c96939187`
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formGuid: '19942922',
          portalId: '868101be-ae3e-422e-bc86-356c96939187',
          fields: [
            {
              name: 'email',
              value: email,
            },
          ],
        }),
      }

      await fetch(endpoint, options)
    },
  },
  termsUrl: 'https://example.it',
  privacyUrl: 'https://example.it',
  menuSections: [
    {
      title: 'About',
      options: [
        { label: 'About Unlock', url: '' },
        { label: 'Roadmap', url: '' },
        { label: 'Careers', url: '' },
      ],
    },
    {
      title: 'Governance',
      options: [
        { label: 'Unlock DAO', url: '' },
        { label: 'Forum', url: '' },
        { label: 'Snapshot', url: '' },
      ],
    },
    {
      title: 'Community',
      options: [
        { label: 'Showcase', url: '' },
        { label: 'State of Unlock', url: '' },
        { label: 'Blog', url: '' },
        { label: 'Events', url: '' },
        { label: 'Grants', url: '' },
      ],
    },
    {
      title: 'Resources',
      options: [
        { label: 'Docs', url: '' },
        { label: 'Developers', url: '' },
        { label: 'Guides', url: '' },
        { label: 'Integrations', url: '' },
        { label: 'Media kit', url: '' },
      ],
    },
  ],
}
