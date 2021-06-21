import React, { useState, useEffect, useContext } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Head from 'next/head'
import Loading from '../interface/Loading'
import { ConfigContext } from '../../utils/withConfig'
import Media from '../../theme/media'

const usePaywall = () => {
  const config = useContext(ConfigContext)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(true)
  const [error, setError] = useState(null)

  const unlock = () => {
    window.unlockProtocol.loadCheckoutModal()
  }

  useEffect(() => {
    const url = new window.URL(window.location.href)

    if (!url.searchParams.get('lock')) {
      setError('Missing lock param!')
      setLoading(false)
      return
    }

    // Set config
    const unlockUserAccounts =
      url.searchParams.get('unlockUserAccounts') === 'true'
    const useMetadataInputs = url.searchParams.get('metadataInputs') === 'true'
    const referrer = url.searchParams.get('referrer')

    window.unlockProtocolConfig = {
      persistentCheckout: false,
      unlockUserAccounts,

      metadataInputs: useMetadataInputs
        ? [
            {
              name: 'First Name',
              type: 'text',
              required: true,
              public: true,
            },
            {
              name: 'Last Name',
              type: 'text',
              required: true,
            },
          ]
        : undefined,
      locks: {
        [url.searchParams.get('lock')]: {},
      },
      referrer,
      network: parseInt(url.searchParams.get('network'), 10),
      callToAction: {
        default: 'This content is locked. You need to unlock it!',
        expired:
          'Your previous membership has now expired.. You need to get a new membership!',
        pending:
          'Thanks for your trust. The transaction is now being processed.',
        confirmed: 'Thanks for being a member!',
        metadata:
          'We need to collect some additional information for your purchase.',
        noWallet:
          'You need to use a crypto-wallet in order to unlock this content.',
      },
    }

    // Remove localStorage (on the demo we do not want to store any accoun)
    localStorage.removeItem('userInfo')

    // Event handler
    const handler = window.addEventListener('unlockProtocol', (e) => {
      if (e.detail === 'unlocked') {
        setLocked(false)
      } else {
        setLocked(true)
      }
    })

    // Load unlock script
    const script = document.createElement('script')
    script.src = `${config.paywallUrl}/static/unlock.latest.min.js`
    script.async = true
    document.body.appendChild(script)

    setLocked(true)
    setLoading(false)

    return () => {
      // Remove the script!
      script.remove()
      window.removeEventListener('unlockProtocol', handler)
    }
  }, [])
  return { loading, locked, error, unlock }
}

export const DemoContent = () => {
  const { locked, loading, error, unlock } = usePaywall()

  return (
    <Container>
      <Fonts />
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
            use and streamlined for readers and publishers.{' '}
          </Subtitle>
          <Section>
            {error && <p>{error}</p>}
            {loading && <Loading />}
            {!loading && !error && (
              <Article>
                <p>
                  It’s become dangerously clear in the last few years that the
                  business model we thought would support a vibrant, open web
                  just isn’t going to work any more. Driving more and more
                  eyeballs to ads was always considered ethically and morally
                  borderline, but today, monetizing clickbait isn’t just
                  economically fragile: it’s feeding our democracies with more
                  misinformation and fake news.
                </p>

                <Locked locked={locked} overlay>
                  The thing is, plenty of publishers and creators have been
                  ahead of the curve on this one, even if we don’t give them
                  much credit for it. They knew that free content can, in fact,
                  be very costly and that real freedom comes from knowledge
                  that’s expensive to produce. They understood that when Stewart
                  Brand famously said that “information wants to be free” he
                  meant free as in “speech” (libre), not free as in “beer”
                  (gratis).
                  <Overlay locked={locked} />
                </Locked>

                <CallToAction locked={locked}>
                  Support our work and read the rest of this article by becoming
                  a member today!
                  <Button onClick={unlock}>Join us</Button>
                </CallToAction>

                <Locked locked={locked}>
                  Some publishers, like the New York Times, got a lot of heat
                  when they introduced their paywall, but the trend they set
                  isn’t reversing: they now have 3M subscribers and aim for 10M
                  by 2020. Hundreds of other news and content organizations are
                  going in the same direction, including this very platform.
                </Locked>
                <Locked locked={locked}>
                  Another trend emerged in the last 10 years: ownership does not
                  seem to matter as much as it used to. People are getting rid
                  of their meticulously amassed records and DVD collections to
                  replace them with monthly subscriptions to Spotify and
                  Netflix. Ride sharing platforms have put yet another dent in
                  the car ownership status symbol… etc. My generation is putting
                  access above ownership.
                </Locked>
              </Article>
            )}
          </Section>
        </Body>
      </Content>
      <Right />
    </Container>
  )
}

export default DemoContent

const Fonts = () => (
  <link
    href="https://fonts.googleapis.com/css?family=Source+Serif+Pro:400,700|UnifrakturCook:700"
    rel="stylesheet"
  />
)

const GlobalStyle = createGlobalStyle`
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

const CallToAction = styled.p`
  text-align: center;
  font-size: 1.2em;
  display: ${(props) => (props.locked === true ? 'block' : 'none')};
`

const Button = styled.button`
  cursor: pointer;
  border: 3px solid #d8d8d8;
  border-radius: 3px;
  font-size: 1.3em;
  background-color: transparent;
  display: block;
  padding: 10px 50px;
  color: rgb(106, 106, 106);
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
`

const Locked = styled.p`
  display: ${(props) =>
    props.locked === false || props.overlay ? 'block' : 'none'};
  position: relative; // Important to make the overlay work
`

const Overlay = styled.span`
  display: ${(props) => (props.locked === false ? 'none' : 'block')};
  position: absolute;
  background: linear-gradient(rgb(253, 250, 247, 0), rgb(253, 250, 247, 1) 70%);
  top: 0;
  width: 100%;
  height: 100%;
`
