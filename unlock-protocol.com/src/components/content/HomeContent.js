import styled from 'styled-components'
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import Signature from '../interface/Signature'
import { SubTitle, ThreeColumns, Column, Section } from '../Components'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import { HomepageButton } from '../interface/buttons/homepage/HomepageButton'

import { OptInForm } from '../interface/OptInForm'

export const HomeContent = () => (
  <Layout forContent>
    <Head>
      <title>{pageTitle()}</title>
      <TwitterTags />
      <OpenGraphTags />
    </Head>
    <Hero>
      <img alt="Unlock" src="/static/images/pages/png/hero.svg" />
      <h1>Monetize the web through memberships</h1>
    </Hero>
    <Headline>
      Unlock lets you let’s you easily lock and manage access to your content,
      apps, community and even real life events and spaces.
    </Headline>
    <HomepageButton />
    <ThreeColumns>
      <Column>
        <SubTitle>No More Middlemen</SubTitle>
        <ImageWithHover base="simple" />
        <Paragraph>
          There are no middlemen, no fees and no gatekeeper who could shut you
          down or control your distribution.
        </Paragraph>
      </Column>
      <Column>
        <SubTitle>Simple Integration</SubTitle>
        <ImageWithHover base="code" />
        <Paragraph>
          Unlock integrates with your website or application using just a few
          lines of code. It&#39;s easy.
        </Paragraph>
      </Column>
      <Column>
        <SubTitle>And Much More</SubTitle>
        <ImageWithHover base="more" />
        <Paragraph>
          For example, Unlock comes with a points system to reward your most
          loyal fans when they share your content with their friends!
        </Paragraph>
      </Column>
    </ThreeColumns>
    <Section>
      <SubHead>Subscribe to Updates</SubHead>
      <Paragraph>
        We will never share your information. Privacy and your trust are our top
        priorities.
      </Paragraph>
      <OptInForm />
    </Section>
    <Signature />
  </Layout>
)

HomeContent.propTypes = {}

export default HomeContent

const ImageWithHover = styled.div`
  border-style: none;
  background: url(${props => `/static/images/pages/png/${props.base}.png`})
    no-repeat center/contain;
  width: 280px;
  height: 200px;
  &:hover {
    background: url(${props =>
        `/static/images/pages/png/${props.base}-hover.png`})
      no-repeat center/contain;
  }
  /* // Preload to avoid flickering effect */
  &:after {
    content: url(${props =>
      `/static/images/pages/png/${props.base}-hover.png`});
    display: none;
  }
`

const Hero = styled.div`
  margin-top: 30px;
  position: relative;
  h1 {
    position: absolute;
    color: var(--white);
    font-weight: 700;
    left: 5%;
    font-size: 40px;
    max-width: 50%;
    top: 50%;
    transform: translate(0%, -66%);
  }
  img {
    width: 100%;
    height: 100%;
  }
`

const SubHead = styled.h2`
  font-size: 36px;
  margin-bottom: 0px;
  color: var(--darkgrey);
  font-weight: 700;
`

const Paragraph = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
`

export const Headline = styled.p`
  font-size: 32px;
  line-height: 42px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 100;
  margin-top: 0px;
  padding-left: 5%;
  padding-right: 5%;
`
