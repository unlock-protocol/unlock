import React from 'react'
import styled from 'styled-components'
import Media from '../../theme/media'
import Svg from './svg'
import { OptInForm } from './OptInForm'

export const H1 = styled.h1`
  font-size: 48px;
  font-family: IBM Plex Serif;
  font-weight: 500;
  margin-top: 0px;
  margin-bottom: 0px;
`

export const H2 = styled.h2`
  margin-top: 0px;
  font-size: 32px;
  margin-bottom: 0px;
  font-weight: 300;
`

export const H3 = styled.h3`
  font-family: IBM Plex Sans;
  font-size: 20px;
  letter-spacing: 1px;
  font-weight: 300;
  text-transform: uppercase;
  color: var(--brand);
  margin-bottom: 8px;
`

export const H4 = styled.h4`
  font-family: IBM Plex Sans;
  font-size: 24px;
  text-align: center;
  color var(--darkgrey);
  margin: 8px;
`

export const Headline = styled.p`
  font-size: 32px;
  line-height: 42px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 100;
  margin-top: 50px;
  margin-bottom: 50px;
  padding-left: 5%;
  padding-right: 5%;
`

export const Icon = styled.span`
  display: inline-block;
  width: ${(props) => props.size || 24}px;
  height: ${(props) => props.size || 24}px;
  border-radius: 100%;
  margin-right: 16px;
`

export const ActionButtons = styled.div`
  display: flex;
  padding: 0px;
  margin-top: 32px;
  ${Media.phone`
    flex-direction: column;
  `};
`

export const ActionButton = styled.a`
  display: flex;
  align-items: center;
  font-size: 24px;
  color: ${(props) => props.color} !important;
  border: 1px solid ${(props) => props.borderColor || props.color};
  background-color: ${(props) => props.contrastColor};
  margin-right: 24px;
  padding: 12px;
  border-radius: 4px;
  transition: background-color 200ms ease;
  cursor: pointer;

  ${Media.phone`
    margin-right: 0px;
    margin-bottom: 24px;
  `};

  ${Icon} {
    background-color: ${(props) => props.color};
  }

  svg {
    fill: ${(props) => props.contrastColor};
  }

  &:hover {
    color: ${(props) => props.contrastColor} !important;
    background-color: ${(props) => props.color};
    ${Icon} {
      background-color: ${(props) => props.contrastColor};
    }
    svg {
      fill: ${(props) => props.color};
    }
  }
`

export const Box = styled.div`
  margin-top: 64px;
  background-color: ${(props) => props.color};
  color: ${(props) => props.contrastColor};
  padding: ${(props) => props.padding || 32}px;
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: ${(props) => props.fontFamily || 'IBM Plex Sans'};
  border-radius: 8px;

  ${Media.phone`
    margin-top: 24px;
    padding: ${(props) => props.padding || 16}px;
  `}

  p {
    font-weight: 300;
    font-size: 24px;
    margin-top: 4px;
  }

  ${H2} {
    color: ${(props) => props.contrastColor};
    ${(props) =>
      props.hero &&
      `
      margin-top: 16px;
      margin-bottom: 32px;
    `}
  }
`
export const Columns = styled.div`
  display: flex;
  margin: 0px -16px;
  flex-direction: ${(props) => (props.transposed ? 'column' : 'row')};

  ${Media.phone`
    margin: 16px 0px;
    flex-direction: column;
  `};

  ${Media.tablet`
    margin: 16px 0px;
    flex-direction: column;
  `}
`

export const Column = styled.div`
  display: flex;
  margin: 16px;
  flex-direction: ${(props) => (props.transposed ? 'row' : 'column')};
  justify-content: start;
  flex: 1 1 0px;

  p {
    font-family: IBM Plex Sans;
    font-weight: 300;
    font-size: 24px;
    text-align: center;
    color var(--darkgrey);
  }

  ${Media.phone`
    margin: 0px;
    margin-bottom: 8px;
    margin-top: 8px;
    flex-direction: column;
  `};

  ${H3} {
    color: var(--darkgrey);
    margin-bottom: 16px;
  }

`

export const BoxQuote = styled(Box)`
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;

  font-family: IBM Plex Sans;

  h4 {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--brand);
  }
`

export const Quote = styled.blockquote`
  padding: 0px;
  margin: 0px;
  font-family: IBM Plex Serif;
  font-size: 32px;
  color: var(--darkgrey);
`

export const Byline = styled.p`
  font-weight: 300;
  font-size: 24px;
  display: flex;
  vertical-align: middle;
  align-items: center;
  color: var(--darkgrey);
  ${Media.phone`
    flex-direction: column;
  `}
`

export const Avatar = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 16px;
`

const Integration = styled.a`
  display: flex;
  align-items: center;
  color: var(--white) !important;
  border: 1px solid var(--white);
  padding: 12px;
  border-radius: 8px;
  transition: background-color 400ms ease;
  width: 230px;
  margin-bottom: 32px;
  padding: 16px;
  font-family: IBM Plex Sans;
  font-size: 24px;
  font-weight: 300;
  cursor: pointer;

  svg {
    fill: var(--white);
  }

  &:hover {
    border: 1px solid #2768c8;
    background-color: #2768c8;
  }
`

export const Illustration = styled.img`
  max-width: 100%;
`

export const IntegrationsBox = () => {
  return (
    <Box
      color="var(--link)"
      contrastColor="var(--white)"
      fontFamily="'IBM Plex Sans'"
    >
      <H2>Check out Unlock’s community-built integrations and plugins.</H2>
      <Columns>
        <Column>
          <H3>Web</H3>
          <Integration href="https://docs.unlock-protocol.com/creators/plugins-and-integrations/wordpress-plugin">
            <Icon size="36">
              <Svg.Wordpress />
            </Icon>
            WordPress
          </Integration>
          <Integration href="https://docs.unlock-protocol.com/creators/plugins-and-integrations#webflow">
            <Icon size="36">
              <Svg.Webflow />
            </Icon>
            Webflow
          </Integration>
          <Integration href="https://docs.unlock-protocol.com/creators/plugins-and-integrations#cloudflare">
            <Icon size="36">
              <Svg.Cloudflare />
            </Icon>
            Cloudflare
          </Integration>
        </Column>
        <Column>
          <H3>Community</H3>
          <Integration href="https://docs.unlock-protocol.com/creators/plugins-and-integrations/discord">
            <Icon size="36">
              <Svg.Discord />
            </Icon>
            Discord
          </Integration>

          <Integration href="https://docs.unlock-protocol.com/creators/plugins-and-integrations#discourse">
            <Icon size="36">
              <Svg.Discourse />
            </Icon>
            Discourse
          </Integration>
        </Column>
        <Column>
          <H3>More</H3>
          <Integration href="https://www.youtube.com/watch?v=oVZi7m-UOtE">
            <Icon size="36">
              <Svg.Decentraland />
            </Icon>
            Decentraland
          </Integration>
          <Integration href="https://docs.unlock-protocol.com/creators/plugins-and-integrations#shopify">
            <Icon size="36">
              <Svg.Shopify />
            </Icon>
            Shopify
          </Integration>
        </Column>
      </Columns>
    </Box>
  )
}

export const GrantsProgramBox = () => {
  return (
    <Box color="#F6C61B" contrastColor="var(--darkgrey)">
      <Columns>
        <Column>
          <H2 color="">Join our Developer Grant Program!</H2>
          <p style={{ textAlign: 'left' }}>
            Unlock Protocol is giving UDT token grants to developers who can
            make the platform more accessible to wider communities.
          </p>
          <ActionButtons>
            <ActionButton
              href="https://share.hsforms.com/1gAdLgNOESNCWJ9bJxCUAMwbvg22"
              contrastColor="#ED663A"
              color="var(--white)"
              borderColor="#ED663A"
            >
              <Icon size="24">
                <Svg.Unlock />
              </Icon>
              Learn About Our Grants
            </ActionButton>
          </ActionButtons>
        </Column>
        <Column
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Illustration
            style={{ maxWidth: '330px' }}
            src="/static/images/illustrations/grants.svg"
          />
        </Column>
      </Columns>
    </Box>
  )
}

export const SignupBox = () => {
  return (
    <Box color="var(--link)" contrastColor="var(--white)">
      <H2>Sign Up for Updates</H2>
      <p>
        We&apos;ll send you fresh news about our platform, including new
        features and opportunities for the community.
      </p>
      <OptInForm />
    </Box>
  )
}
