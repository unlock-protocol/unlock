import React from 'react'
import NoSSR from 'react-no-ssr'
import Head from 'next/head'
import { connect } from 'react-redux'
import styled, { createGlobalStyle } from 'styled-components'
import UnlockPropTypes from '../propTypes'
import Overlay from '../components/lock/Overlay'
import DeveloperOverlay from '../components/developer/DeveloperOverlay'
import withConfig from '../utils/withConfig'
import ShowUnlessUserHasKeyToAnyLock from '../components/lock/ShowUnlessUserHasKeyToAnyLock'
import { LOCK_PATH_NAME_REGEXP } from '../constants'
import Media from '../theme/media'

const Demo = ({ lock }) => {
  return (
    <Container>
      <GlobalStyle />
      <Head>
        <title>Unlock Demo Example - Unlock Times</title>
      </Head>
      <Left />
      <Content>
        <Masthead>Unlock Times</Masthead>
        <Body>
          <Title>Demoing the Unlock Paywall</Title>
          <Subtitle>
            Unlock Times shows off its new subscription paywall that’s easy to
            use and streamlined for readers and publishers.
            {' '}
          </Subtitle>
          <Section>
            <Article>
              <p>
                It’s become dangerously clear in the last few years that the
                business model we thought would support a vibrant, open web just
                isn’t going to work any more. Driving more and more eyeballs to
                ads was always considered ethically and morally borderline, but
                today, monetizing clickbait isn’t just economically fragile:
                it’s feeding our democracies with more misinformation and fake
                news.
              </p>
              <p>
                The thing is, plenty of publishers and creators have been ahead
                of the curve on this one, even if we don’t give them much credit
                for it. They knew that free content can, in fact, be very costly
                and that real freedom comes from knowledge that’s expensive to
                produce. They understood that when Stewart Brand famously said
                that “information wants to be free” he meant free as in “speech”
                (libre), not free as in “beer” (gratis).
              </p>
              <p>
                Some publishers, like the New York Times, got a lot of heat when
                they introduced their paywall, but the trend they set isn’t
                reversing: they now have 3M subscribers and aim for 10M by 2020.
                Hundreds of other news and content organizations are going in
                the same direction, including this very platform.
              </p>
              <p>
                Another trend emerged in the last 10 years: ownership does not
                seem to matter as much as it used to. People are getting rid of
                their meticulously amassed records and DVD collections to
                replace them with monthly subscriptions to Spotify and Netflix.
                Ride sharing platforms have put yet another dent in the car
                ownership status symbol… etc. My generation is putting access
                above ownership.
              </p>
            </Article>
            <Illustration />
          </Section>
        </Body>
      </Content>
      <Right />
      <NoSSR>
        <ShowUnlessUserHasKeyToAnyLock locks={lock ? [lock] : []}>
          <Overlay locks={lock ? [lock] : []} />
        </ShowUnlessUserHasKeyToAnyLock>
        <DeveloperOverlay />
      </NoSSR>
    </Container>
  )
}

Demo.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export const mapStateToProps = ({ locks, router }) => {
  const match = router.location.pathname.match(LOCK_PATH_NAME_REGEXP)
  const lock = match
    ? Object.values(locks).find(lock => lock.address === match[1])
    : null

  return {
    lock,
  }
}

export default withConfig(connect(mapStateToProps)(Demo))

const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css?family=Source+Serif+Pro:400,700|UnifrakturCook:700');

    body {
      background-color: #fdfaf7;
      font-family: 'Source Serif Pro', serif;
    }
`

const Container = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr minmax(500px, 800px) 1fr;

  ${Media.phone`
    grid-template-columns: 0px 1fr 0px;
  `};
`

const Left = styled.div``
const Right = styled.div``
const Content = styled.div``
const Masthead = styled.h1`
  font-family: 'UnifrakturCook', cursive;
  font-weight: bold;
  font-size: 36px;
  color: #6a6a6a;
  margin-bottom: 50px;
`

const Body = styled.div`
  &: before {
    display: block;
    content: '';
    width: 87px;
    height: 3px;
    background-color: var(--silver);
    margin-bottom: 16px;
  }
`

const Title = styled.h1`
  font-size: 36px;
  font-weight: bold;
  color: #6a6a6a;
  margin-bottom: 18px;
`

const Subtitle = styled.div`
  font-size: 32px;
  color: #4a4a4a;
  margin-bottom: 38px;
`

const Section = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px;
  grid-gap: 40px;
  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`

const Article = styled.div`
  color: #4a4a4a;
  line-height: 1.75;
  font-size: 16px;
`

const Illustration = styled.div`
  width: 250px;
  height: 250px;
  opacity: 0.52;
  background-color: #74ce63;
`
