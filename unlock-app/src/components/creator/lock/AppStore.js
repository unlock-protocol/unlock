import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import Svg from '../../interface/svg'
import Button from '../../interface/buttons/Button'
import withConfig from '../../../utils/withConfig'

const Integration = ({ name, icon, action, href }) => (
  <App>
    <Button
      action={action}
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
  action: PropTypes.func,
  href: PropTypes.string,
}

Integration.defaultProps = {
  action: () => {},
  href: null,
}

export class AppStore extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.setDetails = this.setDetails.bind(this)

    this.integrations = {
      custom: {
        name: 'Custom',
        icon: <Svg.Code />,
        details: (
          <Details>
            <DetailTitle>Custom Integration</DetailTitle>
            <DetailBlock>
              <p>
                Easily integrate Unlock into your application flow with a few
                lines of code. We’ve structured it in a way to make it
                incredibly flexible yet light weight.
              </p>
              <ExtraLink>
                <Button
                  backgroundColor="white"
                  borderRadius="3px"
                  size="64px"
                  fillColor="var(--grey)"
                  href="https://github.com/unlock-protocol/unlock/wiki/Integrating-Unlock-on-your-site"
                  target="_blank"
                >
                  <Svg.Documentation />
                </Button>
                <Label>Documentation</Label>
              </ExtraLink>
              <ExtraLink>
                <Button
                  href={`${props.config.paywallUrl}/newdemo?lock=${props.lock.address}&name=${props.lock.name}&type=paywall`}
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
        ),
      },
      tickets: {
        name: 'Tickets',
        icon: <Svg.Ticket />,
        href: 'https://tickets.unlock-protocol.com',
      },
      donations: {
        name: 'Donations',
        icon: <Svg.Heart />,
        href: 'https://donate.unlock-protocol.com/generate.html',
      },
      wordpress: {
        name: 'Wordpress',
        icon: <Svg.Wordpress />,
        href: 'https://wordpress.org/plugins/unlock-protocol/',
      },
    }

    this.state = {
      details: this.integrations.custom.details,
    }
  }

  setDetails(newDetails) {
    this.setState(state => {
      return {
        ...state,
        details: newDetails,
      }
    })
  }

  render() {
    const { details } = this.state
    return (
      <Wrapper>
        <Apps>
          {Object.keys(this.integrations).map(index => {
            const integration = this.integrations[index]
            if (integration.details) {
              return (
                <Integration
                  key={index}
                  name={integration.name}
                  icon={integration.icon}
                  action={() => this.setDetails(integration.details)}
                />
              )
            } else if (integration.href) {
              return (
                <Integration
                  key={index}
                  name={integration.name}
                  icon={integration.icon}
                  href={integration.href}
                />
              )
            }
          })}
        </Apps>
        {details}
      </Wrapper>
    )
  }
}

AppStore.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(AppStore)

const Wrapper = styled.section`
  padding-top: 20px;
  padding-left: 50px;
  padding-bottom: 50px;
`

const Apps = styled.ul`
  display: flex;
  width: 100%;
  height: 75px;
  margin: 0px;
  padding: 0px;
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
`

const DetailBlock = styled.div`
  display: flex;

  p {
    max-width: 400px;
    margin-right: 10px;
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
