import styled from 'styled-components'
import React, { PureComponent } from 'react'
import Layout from '../interface/Layout'
import { Section, Headline, SubTitle, CallToAction, ThreeColumns, Column } from './Components'
import { ActionButton } from '../creator/CreatorLocks'

export default class Home extends PureComponent {
  render() {
    return (
      <Layout forContent={true}>
        <Hero>The Web&#39;s new business model</Hero>
        <Headline>
          Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way.
        </Headline>

        <Action>
          <HomepageButton>Go to Your Dashboard</HomepageButton>
          <ButtonLabel>Requires a browser with an Ethereum wallet</ButtonLabel>
        </Action>

        <ThreeColumns>
          <Column>
            <SubTitle>No More Middlemen</SubTitle>
            <ImageWithHover base='simple' />
            <Paragraph>
              There are no middlemen, no fees and no gatekeeper who could shut you down or control your distribution.
            </Paragraph>
          </Column>
          <Column>
            <SubTitle>Simple Integration</SubTitle>
            <ImageWithHover base='code' />
            <Paragraph>
              Unlock provides a simple snippet of code to integrate easily on your website, as well as several other integration tools...
            </Paragraph>
          </Column>
          <Column>
            <SubTitle>And Much More</SubTitle>
            <ImageWithHover base='more' />
            <Paragraph>
              For example, Unlock comes with a points system to reward your most loyal fans when they share your content their friends!
            </Paragraph>
          </Column>
        </ThreeColumns>

        <Section>
          <CallToAction>Check out our open source code on <a href="https://github.com/unlock-protocol/unlock">GitHub</a>, come work <a href="/jobs">with us</a> or simply <a href="mailto:hello@unlock-protocol.com">get in touch</a>.</CallToAction>
        </Section>

      </Layout>
    )
  }
}

const ImageWithHover = styled.div`
  border-style: none;
  background: url(${props => (`/images/pages/png/${props.base}.png`)}) no-repeat center/contain;
  width: 300px;
  height: 200px;
  &:hover {
    background: url(${props => (`/images/pages/png/${props.base}-hover.png`)}) no-repeat center/contain;
  }
`

const Hero = styled.h1`
  font-size: 36px;
  margin-top: 30px;
  margin-bottom: 0px;
  color: var(--darkgrey);
  font-weight: 700;
`

const Action = styled.div`
  display: grid;
  justify-items: center;
  grid-template-columns: 25% 1fr 25%;
  grid-gap: 16px;
  margin-bottom: 50px;
`

const ButtonLabel = styled.small`
  grid-column: 2;
  font-size: 12px;
  font-weight: 200;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
`

const Paragraph = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
`

const HomepageButton = styled(ActionButton)`
  padding: 20px;
  grid-column: 2;
`
