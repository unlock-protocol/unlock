import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import {
  Section,
  Title,
  Headline,
  Paragraph,
  UnorderedList,
  OrderedList,
  ListItem,
  ShortColumn,
} from '../Components'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import OpenGraphTags from '../page/OpenGraphTags'

export const JobsContent = () => (
  <Layout forContent>
    <Head>
      <title>{pageTitle('Work at Unlock')}</title>
      <TwitterTags
        title={pageTitle('Work at Unlock')}
        description={
          "We're looking for world-class engineers who want to fix the Web forever."
        }
      />
      <OpenGraphTags
        title={pageTitle('Work at Unlock')}
        description={
          "We're looking for world-class engineers who want to fix the Web forever."
        }
        canonicalPath="/jobs"
      />
    </Head>
    <Section>
      <Title>Work at Unlock</Title>
      <Headline>
        We want to provide an environment where you can do your best work. This
        includes (but is not limited to):
      </Headline>
      <ShortColumn>
        <UnorderedList>
          <ListItem>
            Comprehensive health care (including dental and vision) depending on
            location.{' '}
          </ListItem>
          <ListItem>Unlimited personal and vacation days.</ListItem>
          <ListItem>
            Learning and development budget for each employee.
          </ListItem>
          <ListItem>
            Monthly wellness stipend that can be used for a gym membership,
            nutrition counseling, yoga or meditation classes, or any other
            wellness activity of your choice.{' '}
          </ListItem>
          <ListItem>
            Your choice of technical setup (laptop, monitors and software
            licenses).
          </ListItem>
        </UnorderedList>
      </ShortColumn>
    </Section>

    <Section>
      <Title>Interview Process</Title>
      <Headline>
        We&#39;ve clearly-defined our hiring process in order to evaluate your
        application in a fair, inclusive way, as well as to let you prepare.
      </Headline>
      <ShortColumn>
        <OrderedList>
          <ListItem>
            Initial chat conversation with our founder Julien (find him in our{' '}
            <a href="https://discord.gg/Ah6ZEJyTDp">Discord</a>
            !).
          </ListItem>
          <ListItem>
            Depending on the role, you will have more interviews with Julien and
            other team and community members.
          </ListItem>
          <ListItem>
            We&#39;ll call the references you provide (please have your resumé
            ready and updated too!)
          </ListItem>
        </OrderedList>
        <Paragraph>
          We thrive to be respectful of your time and effort by providing you
          feedback early and often.
        </Paragraph>
      </ShortColumn>
    </Section>

    <Section>
      <Title>Current Openings</Title>
      <Headline>
        Please, find all of our{' '}
        <a href="https://unlockprotocol.notion.site/Unlock-Jobs-907811d15c4d490091eb298f71b0954c">
          job listing on this page.
        </a>
      </Headline>
    </Section>
  </Layout>
)
export default JobsContent
