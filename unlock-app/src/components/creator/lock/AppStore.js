import PropTypes from 'prop-types'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { ConfigContext } from '../../../utils/withConfig'

import { AuthenticationContext } from '../../interface/Authenticate'
import UnlockPropTypes from '../../../propTypes'
import Svg from '../../interface/svg'
import Button from '../../interface/buttons/Button'
import {
  Input,
  Button as FormButton,
} from '../../interface/checkout/FormStyles'

const Integration = ({ name, icon, href }) => (
  <App>
    <Button
      href={href}
      target={href ? '_blank' : null}
      size="40px"
      borderRadius="3px"
      label={name}
    >
      {icon}
    </Button>
  </App>
)

Integration.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  href: PropTypes.string,
}

Integration.defaultProps = {
  href: null,
}

const AppStore = ({ lock }) => {
  const config = useContext(ConfigContext)
  const { network } = useContext(AuthenticationContext)
  const [redirectUri, setRediredtUri] = useState('')
  const integrations = {
    wordpress: {
      name: 'Wordpress',
      icon: <Svg.Wordpress />,
      href: 'https://wordpress.org/plugins/unlock-protocol/',
    },
    discord: {
      name: 'Discord (with Swordy Bot)',
      icon: <Svg.Discord />,
      href: 'https://swordybot.com/',
    },
    cloudflare: {
      name: 'Cloudflare',
      icon: <Svg.Cloudflare />,
      href: 'https://unlock-protocol.com/blog/cloudflare-worker',
    },
    webflow: {
      name: 'Webflow',
      icon: <Svg.Webflow />,
      href: 'https://unlock-integration.webflow.io/instructions',
    },
    discourse: {
      name: 'Discourse',
      icon: <Svg.Discourse />,
      href: 'https://unlock.community/',
    },
  }

  const tutorials = {
    adfree: {
      name: 'Ad-Free Experience',
      icon: <Svg.Adfree />,
      href: 'https://docs.unlock-protocol.com/tutorials/ad-free-experience',
    },
    tickets: {
      name: 'Tickets',
      icon: <Svg.Ticket />,
      href: 'https://docs.unlock-protocol.com/tutorials/selling-tickets-for-an-event',
    },
    donations: {
      name: 'Donations',
      icon: <Svg.Heart />,
      href: 'https://docs.unlock-protocol.com/tutorials/receiving-donations-on-github',
    },
    newsletter: {
      name: 'Newsletter',
      icon: <Svg.Newsletter />,
      href: 'https://docs.unlock-protocol.com/tutorials/using-unlock-newsletter',
    },
  }

  const checkoutURLConfig = {
    locks: {
      [lock.address]: {
        network: lock.network,
      },
    },
    redirectUri,
    persistentCheckout: true,
    icon: `${config.services.storage.host}/lock/${lock.address}/icon`,
  }

  const checkoutUrl = new URL(
    `/checkout?paywallConfig=${encodeURIComponent(
      JSON.stringify(checkoutURLConfig)
    )}`,
    window.location.href
  )

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(checkoutUrl)
    alert('URL Copied to your clipboard')
  }

  const openCheckout = async () => {
    window.open(checkoutUrl)
  }

  return (
    <Wrapper>
      <Details>
        <DetailTitle>Purchase Address</DetailTitle>
        <p>
          Share the URL below with your fans if you want them to easily purchase
          this lock&apos;s NFT membership.
        </p>
        <p style={{ margin: '0px' }}>
          Redirect URL:{' '}
          <RedirectUriInput placeholder="URL to which your members ared redirected once they purchased the membership" />
        </p>

        <UrlInput type="disabled" value={checkoutUrl} />
        <CopyButton onClick={copyToClipboard}>Copy</CopyButton>
        <CopyButton onClick={openCheckout}>Open</CopyButton>
      </Details>
      <Details>
        <DetailTitle>Integrate</DetailTitle>
        <p>
          Easily integrate the lock into existing application through the use of
          plugins and bots.
        </p>
        <Apps>
          {Object.keys(integrations).map((index) => {
            const integration = integrations[index]
            return (
              <Integration
                key={index}
                name={integration.name}
                icon={integration.icon}
                href={integration.href}
              />
            )
          })}
        </Apps>
      </Details>
      <Details>
        <DetailTitle>Tutorials</DetailTitle>
        <p>Learn how to create specific experiences for your members.</p>
        <Apps>
          {Object.keys(tutorials).map((index) => {
            const integration = tutorials[index]
            return (
              <Integration
                key={index}
                name={integration.name}
                icon={integration.icon}
                href={integration.href}
              />
            )
          })}
        </Apps>
      </Details>
      <Details>
        <DetailTitle>Custom Integration</DetailTitle>
        <DetailBlock>
          <p>
            Easily integrate Unlock into your web application flow with a few
            lines of code. We’ve structured it in a way to make it incredibly
            flexible yet light weight.
          </p>
          <ExtraLink>
            <Button
              backgroundColor="white"
              borderRadius="3px"
              size="64px"
              fillColor="var(--grey)"
              href="https://docs.unlock-protocol.com/creators/locking-page"
              target="_blank"
            >
              <Svg.Documentation />
            </Button>
            <Label>Documentation</Label>
          </ExtraLink>
        </DetailBlock>
      </Details>
    </Wrapper>
  )
}

AppStore.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default AppStore

const Wrapper = styled.section`
  padding-top: 20px;
  padding-left: 50px;
  padding-bottom: 50px;
`

const Apps = styled.ul`
  display: flex;
  width: 100%;
  margin: 0px;
  margin-top: 8px;
  padding: 0px;
  height: 75px;
`

const App = styled.li`
  display: inline-block;
  margin-right: 15px;
  font-size: 15px;
  font-weight: normal;
`

const Details = styled.div`
  display: block;
  font-family: IBM Plex Sans;
`

const DetailTitle = styled.h3`
  color: var(--blue);
  margin-bottom: 0px;
  margin-top: 8px;
`

const DetailBlock = styled.div`
  display: flex;

  p {
    max-width: 400px;
    margin-right: 10px;
    margin-top: 8px;
  }
`

const ExtraLink = styled.div`
  width: 96px;
  text-align: center;
`

const Label = styled.div`
  font-family: IBM Plex Mono;
  font-weight: 100;
  font-size: 8px;
  line-height: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
`

const CopyButton = styled(FormButton)`
  display: inline-block;
  background-color: var(--lightgrey);
  color: grey;
  width: 50px;
  margin-left: 8px;
  height: 40px;
  font-size: 14px;
  margin-top: 0px;
  font-family: IBM Plex Sans;

  &:hover {
    color: var(--lightgrey);
    background-color: grey;
  }
`

const InterationInput = styled(Input)`
  height: 40px;
  font-size: 14px;
  width: 70%;
`

const UrlInput = styled(InterationInput)`
  font-family: 'Courier New', Courier, monospace;
  color: grey;
`

const RedirectUriInput = styled(Input)`
  height: 24px;
  background-color: white;
  font-size: 12px;
  width: 50%;

  &::placeholder {
    opacity: 0.5;
  }
`
