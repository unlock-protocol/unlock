import styled from 'styled-components'
import React from 'react'

import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import Svg from '../interface/svg'
import Media from '../../theme/media'

import {
  H1,
  H2,
  H3,
  ActionButtons,
  ActionButton,
  Box,
  Columns,
  Column,
  Icon,
  IntegrationsBox,
  GrantsProgramBox,
  SignupBox,
} from '../interface/LandingPageComponents'

export const DevelopersContent = () => {
  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle('Unlock for Developers')}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>

      <Box hero color="#142A4A" contrastColor="var(--white)">
        <Columns>
          <Column>
            <H1>Unlock for Developers</H1>

            <H2>Build applications with customizable membership NFTs.</H2>
          </Column>
          <Column
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: '1',
            }}
          >
            <CodeSnippet src="/images/illustrations/code-snippet.png" />{' '}
          </Column>
        </Columns>
        <ActionButtons>
          <ActionButton
            href="https://docs.unlock-protocol.com/"
            contrastColor="#142A4A"
            color="var(--white)"
          >
            <Icon size="24">
              <Svg.Docs />
            </Icon>
            Documentation
          </ActionButton>
          <ActionButton
            href="https://github.com/unlock-protocol/unlock"
            contrastColor="#142A4A"
            color="var(--white)"
          >
            <Icon size="24">
              <Svg.Github />
            </Icon>
            Github
          </ActionButton>

          <ActionButton
            href="https://docs.unlock-protocol.com/creators/plugins-and-integrations"
            contrastColor="#142A4A"
            color="var(--white)"
          >
            <Icon size="24">
              <Svg.AppStore />
            </Icon>
            Plugins & Integrations
          </ActionButton>
        </ActionButtons>
      </Box>

      <Box
        padding="0"
        color="transparent"
        fontFamily="'IBM Plex Sans', sans serif"
      >
        <H3>How Unlock works</H3>
        <p>
          Unlock has two distinct concepts: <strong>Locks</strong> and{' '}
          <strong>Keys</strong>.
        </p>
        <Columns>
          <Column>
            <Point>
              <IconWrapper
                style={{
                  minWidth: '64px',
                  maxWidth: '64px',
                  height: '64px',
                  backgroundColor: 'var(--link)',
                }}
              >
                <Svg.Lock viewBox="-46 -30 180 180" />
              </IconWrapper>
              <p>
                <strong>Create Locks</strong> through our dashboard or API and
                place them anywhere you want to check for memberships.
              </p>
            </Point>
            <Point>
              <IconWrapper
                style={{
                  minWidth: '64px',
                  maxWidth: '64px',
                  height: '64px',
                  backgroundColor: 'var(--brand)',
                }}
              >
                <Svg.Key />
              </IconWrapper>
              <p>
                <strong>Users buy Keys</strong> (Non Fungible Tokens) which are
                checked by the lock. Valid keys grant users access.
              </p>
            </Point>
          </Column>
          <Column>
            <Point>
              <IconWrapper
                style={{
                  minWidth: '64px',
                  maxWidth: '64px',
                  height: '64px',

                  backgroundColor: 'var(--green)',
                }}
              >
                <Svg.AppStore />
              </IconWrapper>
              <p>
                Locks can be added to <strong>any kind of software</strong>,
                from web applications, to native games, through SAAS platforms.
              </p>
            </Point>
            <Point>
              <img
                style={{
                  minWidth: '64px',
                  maxWidth: '64px',
                  height: '64px',

                  marginRight: '16px',
                }}
                width="64"
                alt="networks"
                src="/images/illustrations/networks.svg"
              />

              <p>
                Unlock supports <strong>multiple chains</strong>, price in any
                ERC20, and <strong>Credit Card</strong> checkout.
              </p>
            </Point>
          </Column>
        </Columns>
      </Box>

      <Box padding="0" color="transparent">
        <Columns transposed>
          <Column transposed>
            <Tutorial href="https://docs.unlock-protocol.com/creators/deploying-lock">
              <Illustration>
                <img alt="space" src="/images/illustrations/space/1.png" />
                <IconWrapper
                  style={{
                    backgroundColor: 'var(--brand)',
                  }}
                >
                  <Svg.Key />
                </IconWrapper>
              </Illustration>
              <h3>Get started</h3>
              <h2>Create a lock</h2>
              <p>
                The first step to using Unlock as a creator is to deploy your
                own lock so you can sell memberships to your own content! Each
                membership is a customizable NFT.{' '}
              </p>
            </Tutorial>

            <Tutorial href="https://docs.unlock-protocol.com/creators/enabling-credit-cards">
              <Illustration>
                <img alt="space" src="/images/illustrations/space/2.png" />
                <IconWrapper
                  style={{
                    backgroundColor: 'var(--brand)',
                  }}
                >
                  <Svg.CreditCard />
                </IconWrapper>
              </Illustration>
              <h3>Guide</h3>
              <h2>Enable Credit Cards</h2>
              <p>
                Learn how to enable credit cards to enable non-crypto users to
                access your membership benefits and features.{' '}
              </p>
            </Tutorial>
          </Column>

          <Column transposed>
            <Tutorial href="https://docs.unlock-protocol.com/creators/tutorials-1">
              <Illustration>
                <img alt="space" src="/images/illustrations/space/3.png" />
                <IconWrapper
                  style={{
                    backgroundColor: 'var(--brand)',
                  }}
                >
                  <Svg.Docs />
                </IconWrapper>
              </Illustration>
              <h3>Guide</h3>
              <h2>Tutorials</h2>
              <p>
                Learn about how to use Unlock for a newsletter, build an ad-free
                experience or sell tickets for an event. Learn about how to use
                Unlock for a newsletter, build an ad-free experience or sell
                tickets for an event.{' '}
              </p>
            </Tutorial>

            <Tutorial href="https://www.unlockshowcase.com/">
              <Illustration>
                <img alt="space" src="/images/illustrations/space/4.png" />
                <IconWrapper
                  style={{
                    backgroundColor: 'var(--brand)',
                  }}
                >
                  <Svg.Idea />
                </IconWrapper>
              </Illustration>
              <h3>Guide</h3>
              <h2>Unlock Use Cases</h2>
              <p>
                See all of the different ways Unlock is being used by developers
                and creators for their own custom products and experiences.{' '}
              </p>
            </Tutorial>
          </Column>
        </Columns>
      </Box>
      <IntegrationsBox />

      <GrantsProgramBox />

      <SignupBox />
    </Layout>
  )
}

DevelopersContent.propTypes = {}

export default DevelopersContent

const IconWrapper = styled.div`
  margin-right: 16px;
  border-radius: 50%;

  svg {
    fill: var(--white);
  }
`
const Illustration = styled.div`
  position: relative;

  img {
    width: 100%;
    border-radius: 4px;
  }

  ${IconWrapper} {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 128px;
    height: 128px;
  }
`

const CodeSnippet = styled.img`
  width: 450px;
  ${Media.phone`
    width: 300px;
  `};
`

const Point = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  p {
    margin-top: 0px;
    text-align: left;
  }
`

const Tutorial = styled.a`
  display: flex;
  flex-direction: column;
  flex: 1 1 0px;
  border: 1px solid var(--grey);
  padding: 16px;
  border-radius: 4px;
  justify-content: stretch;
  margin: 0px 16px;

  &:first-child {
    margin-left: 0px;
  }

  &:last-child {
    margin-right: 0px;
  }

  ${Media.phone`
    margin: 16px 0px !important;
  `}

  h3 {
    font-family: 'IBM Plex Sans', Helvetica, sans-serif;
    font-weight: 500;
    font-size: 16px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #2768c8;
    margin-bottom: 8px;
  }

  h2 {
    font-family: 'IBM Plex Serif', serif;
    font-weight: 500;
    font-size: 32px;
    margin-top: 8px;
    margin-bottom: 4px;
    color: var(--slate);
  }

  p {
    text-align: left;
  }
`
