import styled from 'styled-components'
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import Signature from '../interface/Signature'
import { Headline, SubTitle, ThreeColumns, Column } from '../Components'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import { HomepageButton } from '../interface/buttons/homepage/HomepageButton'

export const HomeContent = () => (
  <Layout forContent>
    <Head>
      <title>{pageTitle()}</title>
      <TwitterTags />
      <OpenGraphTags />
    </Head>
    <Hero>The Web&#39;s new business model</Hero>
    <Headline>
      Unlock is a protocol which enables creators to monetize their content with
      a few lines of code in a fully decentralized way.
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

const Hero = styled.h1`
  font-size: 36px;
  margin-top: 30px;
  margin-bottom: 0px;
  color: var(--darkgrey);
  font-weight: 700;
`

const Paragraph = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
`
