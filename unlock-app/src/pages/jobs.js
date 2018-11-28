import styled from 'styled-components'
import React from 'react'
import Head from 'next/head'
import Layout from '../components/interface/Layout'
import Signature from '../components/interface/Signature'
import {
  Section,
  Title,
  Headline,
  SubTitle,
  Paragraph,
  UnorderedList,
  OrderedList,
  ListItem,
  ShortColumn,
} from '../components/Components'
import { pageTitle } from '../constants'
import { TwitterTags } from '../components/page/TwitterTags'
import OpenGraphTags from '../components/page/OpenGraphTags'

export const Jobs = () => (
  <Layout forContent>
    <Head>
      <title>{pageTitle('Work at Unlock')}</title>
      <TwitterTags
        title={pageTitle('Work at Unlock')}
        description={
          'We\'re looking for world-class engineers who want to fix the Web forever.'
        }
      />
      <OpenGraphTags
        title={pageTitle('Work at Unlock')}
        description={
          'We\'re looking for world-class engineers who want to fix the Web forever.'
        }
        canonicalPath="/jobs"
      />
    </Head>
    <Section>
      <Title>Work at Unlock</Title>
      <UnorderedList>
        <ListItem>
          <a href="#full-stack-engineer">Senior Full Stack Engineer</a>
        </ListItem>
        <ListItem>
          <a href="#front-end-engineer">Frontend Engineer</a>
        </ListItem>
      </UnorderedList>

      <SubTitle>People first</SubTitle>
      <Headline>
        We want to provide an environment where you can do your best work. This
        includes (but is not limited to):
      </Headline>
      <ShortColumn>
        <UnorderedList>
          <ListItem>
            Comprehensive health care (including dental and vision) for you,
            100% paid by Unlock (75% for your dependents).
            {' '}
          </ListItem>
          <ListItem>Unlimited personal and vacation days.</ListItem>
          <ListItem>
            Learning and development budget for each employee.
          </ListItem>
          <ListItem>
            Monthly wellness stipend that can be used for a gym membership,
            nutrition counseling, yoga or meditation classes, or any other
            wellness activity of your choice.
            {' '}
          </ListItem>
          <ListItem>
            Your choice of technical setup (laptop, monitors and software
            licenses).
          </ListItem>
          <ListItem>Catered lunch every day in the office.</ListItem>
          <ListItem>Citibike membership.</ListItem>
          <ListItem>Flexible work from home policy.</ListItem>
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
            Initial chat conversation with our founder Julien (find him in our
            {' '}
            <a href="https://t.me/unlockprotocol">Telegram group</a>
            !).
          </ListItem>
          <ListItem>
            Open Source Bounty assignment: all of Unlock&#39;s code is public.
            We&#39;ll ask you to submit a pull request for
            {' '}
            <a href="https://github.com/unlock-protocol/unlock/issues">
              one of the issues
            </a>
            {' '}
            which has a bounty (look for the
            <Gitcoin>
              <span role="img" aria-label="bounty">
                💰
              </span>
              gitcoin
            </Gitcoin>
            {' '}
            label).
          </ListItem>
          <ListItem>
            Once your Pull Request has been merged, we&#39;ll invite you for a
            second round of interviews (expect 3 or 4) with the team.
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

    <ShortColumn>
      <Section anchor="full-stack-engineer">
        <Title>Full Stack Engineer</Title>
        <JobDetails>New York — Engineering — Full Time</JobDetails>
        <SubTitle>About You</SubTitle>

        <Paragraph>
          Do you think that the web&#39;s
          {' '}
          <a href="https://www.theatlantic.com/technology/archive/2014/08/advertising-is-the-internets-original-sin/376041/">
            original sin
          </a>
          {' '}
          is its lack of business model? Do you think that individuals,
          democracies and the web, deserve better than click-bait, information
          overload and fake news?
        </Paragraph>
        <Paragraph>
          Are you excited about empowering creators by building the tools and
          interfaces which will let them monetize their creations without
          gatekeepers?
        </Paragraph>
        <Paragraph>
          Do you want to learn and share your experiences with a team of
          skillful and curious colleagues?
        </Paragraph>
        <Paragraph>
          You should consider joining the Unlock team on our journey.
        </Paragraph>

        <SubTitle>About The Role</SubTitle>
        <Paragraph>
          At Unlock, you&#39;ll work with a team of experienced engineers, open
          web advocates and entrepreneurs who founded successful companies with
          significant exits. Unlock will soon become the default business model
          for the web - and you should expect your code and designs to be used
          by hundreds of millions of users, all over the world.
        </Paragraph>
        <Paragraph>
          We value positive energy, curiosity and constant learning, so you
          should expect this job description to be slightly outdated after a
          couple months. At first, we believe you&#39;ll help us with:
        </Paragraph>

        <UnorderedList>
          <ListItem>
            Design a service-oriented architecture to cover Unlock&#39;s backend
            needs (storage, background jobs, APIs...)
          </ListItem>
          <ListItem>
            Implement services to normalize and store data pulled from our smart
            contracts
          </ListItem>
          <ListItem>
            Build both client-side and server-side APIs which will be used to
            communicate data between our servers on our front end applications
          </ListItem>
        </UnorderedList>

        <Paragraph>
          Candidates for this position should have a solid background in
          back-end technologies, as well as the ability to consider front-end
          challenges. You should be able to make solid technical choices while
          taking into account differing requirements from a wide range of
          stakeholders in a software architecture.
          <br />
          Previous experience in open source development and a strong interest
          in crypto / decentralization is a plus.
        </Paragraph>

        <SubTitle>Requirements</SubTitle>
        <UnorderedList>
          <ListItem>
            5+ years of experience in software engineering on both front-end and
            back-end technologies
          </ListItem>
          <ListItem>
            Experience working on a large production codebases, including
            deployments
          </ListItem>
          <ListItem>
            You ship high quality, well tested and documented code to meet the
            needs of users, customers, and colleagues
          </ListItem>
          <ListItem>
            Great communication skills to ensure efficient collaboration with
            other team members and our community
          </ListItem>
          <ListItem>
            Be a steward and influencer of our early engineering culture
          </ListItem>
          <ListItem>In NYC or willing to relocate</ListItem>
        </UnorderedList>

        <SubTitle>Great to have</SubTitle>
        <UnorderedList>
          <ListItem>
            Managed small to mid size teams (including hiring and mentoring)
          </ListItem>
          <ListItem>Experience working on open source projects</ListItem>
          <ListItem>Passion for cryptography and cyber security</ListItem>
        </UnorderedList>

        <SubTitle>Compensation : $130K – $160K, stock options</SubTitle>
      </Section>

      <Section>
        <Title>Applications</Title>
        <Paragraph>
          If you are interested in applying for a position at Unlock, please
          send an email containing your resume, Github, and LinkedIn to
          {' '}
          <a href="mailto:julien@unlock-protocol.com">
            julien@unlock-protocol.com
          </a>
          , and reach out to Julien in our
          {' '}
          <a href="https://t.me/unlockprotocol">Telegram group</a>
          !).
        </Paragraph>
      </Section>
    </ShortColumn>

    <ShortColumn>
      <Section anchor="front-end-engineer">
        <Title>Front-End Engineer</Title>
        <JobDetails>New York — Engineering — Full Time</JobDetails>
        <SubTitle>About You</SubTitle>

        <Paragraph>
          Do you think that the web&#39;s
          {' '}
          <a href="https://www.theatlantic.com/technology/archive/2014/08/advertising-is-the-internets-original-sin/376041/">
            original sin
          </a>
          {' '}
          is its lack of business model? Do you think that individuals,
          democracies and the web, deserve better than click-bait, information
          overload and fake news?
        </Paragraph>
        <Paragraph>
          Are you excited about empowering creators by building the tools and
          interfaces which will let them monetize their creations without
          gatekeepers?
        </Paragraph>
        <Paragraph>
          Do you want to learn and share your experiences with a team of
          skillful and curious colleagues?
        </Paragraph>
        <Paragraph>
          You should consider joining the Unlock team on our journey.
        </Paragraph>

        <SubTitle>About The Role</SubTitle>
        <Paragraph>
          At Unlock, you&#39;ll work with experienced engineers, open web
          advocates and entrepreneurs who founded successful companies with
          significant exits. Unlock will soon become the default business model
          for the web - and you should expect your code and designs to be used
          by hundreds of millions of users, all over the world.
        </Paragraph>
        <Paragraph>
          We value positive energy, curiosity and constant learning, so you
          should expect this job description to be slightly outdated after a
          couple months. At first, we believe you&#39;ll help us with:
        </Paragraph>

        <UnorderedList>
          <ListItem>
            Tools for creators: You will be in charge of building a
            comprehensive yet simple interface to empower creators to create the
            locks they need and embed them in their own sites or platforms.
          </ListItem>
          <ListItem>
            Checkout UX: Unlock will provide the best paywall you’ve ever used.
            It needs to be smooth and elegant.
          </ListItem>
          <ListItem>
            Front-end architecture: Both of the goals above will be served by a
            robust and maintainable architecture. Your job includes making
            informed decisions based on these goals as well as implementing a
            technical foundation that will enable rapid iteration.
          </ListItem>
        </UnorderedList>

        <Paragraph>
          Candidates for this position should have a solid background in
          front-end technologies like React, Redux and the whole JavaScript
          stack. Previous experience in open source development and a strong
          interest in crypto / decentralization is a plus.
        </Paragraph>

        <SubTitle>Requirements</SubTitle>
        <UnorderedList>
          <ListItem>2+ years of experience in software engineering</ListItem>
          <ListItem>
            Deep working knowledge/expertise with modern client side JavaScript
            applications and frameworks (React, Redux, SASS...)
            {' '}
          </ListItem>
          <ListItem>
            Advanced knowledge of the web stack and standards (ES6/7, PWA...)
          </ListItem>
          <ListItem>
            You ship high quality, well tested and documented code to meet the
            needs of users, customers, and colleagues
          </ListItem>
          <ListItem>
            High degree of autonomy and extensive communication skills to ensure
            that efficient collaboration with other team members and our
            community
          </ListItem>
          <ListItem>
            Be a steward and influencer of our early engineering culture
          </ListItem>
          <ListItem>In NYC or willing to relocate</ListItem>
        </UnorderedList>

        <SubTitle>Great to have</SubTitle>
        <UnorderedList>
          <ListItem>Experience working on open source projects</ListItem>
          <ListItem>Passion of cryptography and cyber security</ListItem>
          <ListItem>Interest in user experience and the visual arts</ListItem>
        </UnorderedList>

        <SubTitle>Compensation : $110K – $140K, stock options</SubTitle>
      </Section>
    </ShortColumn>

    <Signature />
  </Layout>
)

const JobDetails = styled.div`
  font-family: 'IBM Plex Serif', serif;
`

const Gitcoin = styled.span`
  background-color: #fbca04;
  color: #000000;
  height: 20px;
  padding: 0.15em 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 15px;
  border-radius: 2px;
  box-shadow: inset 0 -1px 0 rgba(27, 31, 35, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
`

export default Jobs
