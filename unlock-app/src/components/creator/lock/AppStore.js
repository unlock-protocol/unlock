import PropTypes from 'prop-types'
import React, { useContext } from 'react'

import styled from 'styled-components'
import { AuthenticationContext } from '../../interface/Authenticate'
import UnlockPropTypes from '../../../propTypes'
import Svg from '../../interface/svg'
import Button from '../../interface/buttons/Button'

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
  const { network } = useContext(AuthenticationContext)
  const integrations = {
    adfree: {
      name: 'Ad-Free Experience',
      icon: <Svg.Adfree />,
      href: 'https://docs.unlock-protocol.com/tutorials/ad-free-experience',
    },
    tickets: {
      name: 'Tickets',
      icon: <Svg.Ticket />,
      href:
        'https://docs.unlock-protocol.com/tutorials/selling-tickets-for-an-event',
    },
    donations: {
      name: 'Donations',
      icon: <Svg.Heart />,
      href:
        'https://docs.unlock-protocol.com/tutorials/receiving-donations-on-github',
    },
    newsletter: {
      name: 'Newsletter',
      icon: <Svg.Newsletter />,
      href:
        'https://docs.unlock-protocol.com/tutorials/using-unlock-newsletter',
    },
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
  }

  return (
    <Wrapper>
      <DetailTitle>Integrate</DetailTitle>
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
      <Details>
        <DetailTitle>Custom Integration</DetailTitle>
        <DetailBlock>
          <p>
            Easily integrate Unlock into your application flow with a few lines
            of code. We’ve structured it in a way to make it incredibly flexible
            yet light weight.
          </p>
          <ExtraLink>
            <Button
              backgroundColor="white"
              borderRadius="3px"
              size="64px"
              fillColor="var(--grey)"
              href="https://docs.unlock-protocol.com/"
              target="_blank"
            >
              <Svg.Documentation />
            </Button>
            <Label>Documentation</Label>
          </ExtraLink>
          <ExtraLink>
            <Button
              href={`/demo?network=${network}&lock=${lock.address}`}
              target="_blank"
              backgroundColor="white"
              borderRadius="3px"
              size="64px"
              fillColor="var(--grey)"
            >
              <Svg.LiveDemo />
            </Button>
            <Label>Live Demo</Label>
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
  border-top: 1px solid var(--lightgrey);
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
