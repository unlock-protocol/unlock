import React from 'react'
import Layout from '../interface/Layout'
import { Section, Title, Headline, SubTitle, CallToAction, Paragraph, UnorderedList, OrderedList, ListItem, ShortColumn } from './Components'

export const Jobs = () => (
  <Layout forContent={true}>
    <Section>
      <Title>Work at Unlock</Title>
      <UnorderedList>
        <ListItem><a href="#front-end-engineer">Senior Frontend Engineer</a></ListItem>
      </UnorderedList>
    </Section>

    <Section>
      <Title>Interview Process</Title>
      <Headline>We think that an explicit process will let us evaluate your skills in the most fair way, as well as will let you prepare adequately.</Headline>
      <ShortColumn>
        <OrderedList>
          <ListItem>Initial chat conversation with our founder Julien (find him in our Telegram group!).</ListItem>
          <ListItem>Open Source Bounty assignment: all of Unlock&#39;s code is public. We&#39;ll ask you to submit a pull request for one of the issues which has a bounty.</ListItem>
          <ListItem>Once your Pull Request has been merged, we&#39;ll invite you for a second round of interviews (expect 3 or 4) with the team.</ListItem>
          <ListItem>Reference checks (please have your resumé ready and updated too!)</ListItem>
        </OrderedList>
        <Paragraph>We thrive to be respectful of your time and effort by providing you feedback early and often.</Paragraph>
      </ShortColumn>
    </Section>

    <ShortColumn>
      <Section anchor="front-end-engineer">
        <Title>Senior Frontend Engineer</Title>
        <SubTitle>About You</SubTitle>

        <Paragraph>
              Do you think that the web&#39;s original sin is its lack of business model? Do you think that individuals, democracies and the web, deserve better than click-bait, information overload or fake news?
        </Paragraph>
        <Paragraph>
              Are you excited about empowering creators by building the tools and interfaces which will let them monetize their creations without gate keepers?
        </Paragraph>
        <Paragraph>
              Do you want to learn and share your experiences with a team of skillful and curious colleagues? You should consider joining the Unlock team on our journey.
        </Paragraph>

        <SubTitle>About The Role</SubTitle>
        <Paragraph>
              By joining Unlock, you&#39;re working with experienced engineers, open web advocates and entrepreneurs who founded successful companies with significant exits. Unlock will soon become the default business model for the web and you should expect your code and designs to be used by hundreds of millions of users, all over the world.
        </Paragraph>
        <Paragraph>
              We value positive energy, curiosity and constant learning, so you should expect this job description to be slightly outdated after a couple months, but at first, we believe you&#39;ll help us with:
        </Paragraph>

        <UnorderedList>
          <ListItem>Tools for creators: You will be in charge of building a comprehensive yet simple interface to empower creators and let them create the locks they need.</ListItem>
          <ListItem>Checkout UX: Unlock will provide the best paywall you’ve ever used. It needs to be smooth and elegant.</ListItem>
          <ListItem>Front end architecture: Both of the goals above will be served by a robust and maintainable architecture. Your job includes making informed decisions based on these goals as well as implement the foundation for frequent iterations.</ListItem>
        </UnorderedList>

        <Paragraph>
              Candidates for this position should have a solid background in front end technologies like React, Redux and the whole JavaScript stack. Previous experience in open source development and a strong interest in crypto / decentralization is a plus.
        </Paragraph>

        <SubTitle>Requirements</SubTitle>
        <UnorderedList>
          <ListItem>4+ years of experience in software engineering</ListItem>
          <ListItem>Deep working knowledge/expertise with modern JS applications and frameworks (React, Redux, SASS...) </ListItem>
          <ListItem>Advanced knowledge of the web stack and standards (ES6/7, PWA...)</ListItem>
          <ListItem>You ship high quality, well tested and documented code to meet the needs of users customers and colleagues</ListItem>
          <ListItem>High degree of autonomy and extensive communication skills to ensure that efficient collaboration with other team members</ListItem>
          <ListItem>Be a steward and influencer of our early engineering culture</ListItem>
          <ListItem>In NYC or willing to relocate</ListItem>
        </UnorderedList>

        <SubTitle>Great to have</SubTitle>
        <UnorderedList>
          <ListItem>Experience working on open source projects</ListItem>
          <ListItem>Passion of cryptography and cyber security</ListItem>
          <ListItem>Interest for user experience and visual arts</ListItem>
        </UnorderedList>

        <SubTitle>Compensation : $110K – $140K, stock options</SubTitle>
      </Section>

      <Section>
        <Title>Applications</Title>
        <Paragraph>
              If you are interested in applying for a position at Unlock, please send an email containing your resume, Github, and Linkedin to <a href="mailto:julien@unlock-protocol.com">julien@unlock-protocol.com</a>, and reach out to Julien in our <a href="https://t.me/unlockprotocol">Telegram group</a>!).
        </Paragraph>
      </Section>
    </ShortColumn>

    <Section>
      <CallToAction>Check out our open source code on <a href="https://github.com/unlock-protocol/unlock">GitHub</a>, come work <a href="/jobs">with us</a> or simply <a href="mailto:hello@unlock-protocol.com">get in touch</a>.</CallToAction>
    </Section>

  </Layout>
)

export default Jobs
