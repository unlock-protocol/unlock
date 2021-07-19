import styled from 'styled-components'
import React from 'react'

import Head from 'next/head'
import getConfig from 'next/config'
import Link from 'next/link'
import UnlockPropTypes from '../../propTypes'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import Svg from '../interface/svg'
import { OptInForm } from '../interface/OptInForm'
import { Demo } from '../interface/Demo'

import {
  H1,
  H2,
  H3,
  H4,
  ActionButtons,
  ActionButton,
  Box,
  Columns,
  Column,
  Icon,
  BoxQuote,
  Quote,
  Avatar,
  Byline,
} from '../interface/LandingPageComponents'

export const HomeContent = ({ posts }) => {
  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle()}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>

      <Box hero color="var(--white)">
        <Columns>
          <Column>
            <H1>
              Add memberships <br />
              to your
              <RotatingWords>
                <Word>website</Word>
                <Word>app</Word>
                <Word>game</Word>
                <Word>shop</Word>
                <Word>API</Word>
              </RotatingWords>
            </H1>

            <H2>
              Unlock ownership of your community, across all your platforms.
            </H2>
            <ActionButtons>
              <ActionButton
                href="https://docs.unlock-protocol.com/creators/plugins-and-integrations"
                color="var(--link)"
                contrastColor="var(--white)"
              >
                <Icon size="24">
                  <Svg.Key />
                </Icon>
                Integrations
              </ActionButton>
              <ActionButton
                href="https://docs.unlock-protocol.com/"
                color="var(--brand)"
                contrastColor="var(--white)"
              >
                <Icon size="24">
                  <Svg.Docs />
                </Icon>
                Documentation
              </ActionButton>
            </ActionButtons>
          </Column>
          <Column
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: '1',
            }}
          >
            <Illustration
              style={{ maxWidth: '330px' }}
              src="/static/images/illustrations/banner-key.svg"
            />{' '}
          </Column>
        </Columns>
      </Box>

      <Box color="transparent" fontFamily="'IBM Plex Serif', serif">
        <H3>What you can do with Unlock</H3>
        <p>
          Create locks and place them anywhere you’d like to lock content. Users
          can purchase memberships as NFT keys that grant access to content,
          tickets and anything else you’d like to monetize.
        </p>
        <ActionButtons style={{ justifyContent: 'center' }}>
          <ActionButton
            href={`${getConfig().publicRuntimeConfig.unlockApp}/dashboard`}
            color="var(--white)"
            contrastColor="var(--link)"
            borderColor="var(--link)"
          >
            <Icon size="24">
              <Svg.Home />
            </Icon>
            Create & Manage Locks
          </ActionButton>
          <ActionButton
            href={`${getConfig().publicRuntimeConfig.unlockApp}/keychain`}
            color="var(--brand)"
            contrastColor="var(--white)"
          >
            <Icon size="24">
              <Svg.Key />
            </Icon>
            Manage Keys & Memberships
          </ActionButton>
        </ActionButtons>
      </Box>

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
                <Svg.Discourse />
              </Icon>
              Decentraland
            </Integration>
            <Integration href="https://docs.unlock-protocol.com/creators/plugins-and-integrations#shopify">
              <Icon size="36">
                <Svg.Discourse />
              </Icon>
              Shopify
            </Integration>
          </Column>
        </Columns>
      </Box>

      <Box color="transparent">
        <H3>Why Unlock?</H3>
        <Columns>
          <Column>
            <Illustration
              style={{ maxHeight: '150px' }}
              src="/static/images/illustrations/ecosystem.svg"
            />
            <H4>
              Your Content
              <br />
              Your community
            </H4>
            <p
              style={{
                padding: '8px 0px',
                marginTop: '0px',
                marginBottom: '4px',
              }}
            >
              Memberships are not tied to any platform, giving you the freedom
              to take your members anywhere.
            </p>
            <p style={{ marginTop: 'auto' }}>
              → {/* Replace with actual case studies links! */}
              <Link href="https://docs.unlock-protocol.com/creators/tutorials-1">
                <a>Case Studies</a>
              </Link>
            </p>
          </Column>
          <Column>
            <Illustration
              style={{ maxHeight: '150px' }}
              src="/static/images/illustrations/cryptoccard.svg"
            />
            <H4>
              Accept Credit Cards &
              <br />
              Crypto
            </H4>
            <p
              style={{
                padding: '8px 0px',
                marginTop: '0px',
                marginBottom: '4px',
              }}
            >
              Both FIAT and Web3 friendly, allow your customers to pay in the
              currency they’re most comfortable with.
            </p>

            <p style={{ marginTop: 'auto' }}>
              →{' '}
              <Link href="https://docs.unlock-protocol.com/creators/deploying-lock">
                <a>Documentation</a>
              </Link>
            </p>
          </Column>

          <Column>
            <Illustration
              style={{ maxHeight: '150px' }}
              src="/static/images/illustrations/governance.svg"
            />
            <H4>
              Community
              <br />
              Owned & Governed
            </H4>
            <p
              style={{
                padding: '8px 0px',
                marginTop: '0px',
                marginBottom: '4px',
              }}
            >
              Unlock is an open-source protocol. Developers and creators co-own
              the protocol.
            </p>
            <p style={{ marginTop: 'auto' }}>
              →{' '}
              <Link href="https://vote.unlock-protocol.com/#/unlock-protocol.eth">
                <a>Governance</a>
              </Link>
            </p>
          </Column>
        </Columns>
      </Box>

      <Box color="var(--white)" fontFamily="'IBM Plex Sans'">
        <Columns>
          <Column>
            <H2>Try Unlock</H2>
            <p style={{ textAlign: 'left' }}>
              Click to become an Unlock Member. Get access to the comments in
              our blog, discounts on our shop, our discord community.
            </p>
          </Column>
          <Column>
            <Column>
              <Demo />
            </Column>
          </Column>
        </Columns>
      </Box>

      <BoxQuote>
        <H3>What the community is saying</H3>
        <Quote>
          “I always thought there were better opportunities to monetise web game
          content. Unlock Protocol has enabled me to create quite advanced
          functionality that I would otherwise not have been able to do.”
        </Quote>
        <Byline>
          <Avatar
            alt="Henry Hoffman"
            width="24"
            src="https://pbs.twimg.com/profile_images/928785269557428225/m-8odw-X_400x400.jpg"
          />
          Henry Hoffman, Co-Founder newfangled.games.{' '}
          <img
            style={{ display: 'inline-block', margin: '8px' }}
            alt="twitter"
            width="24"
            src="/static/images/illustrations/twitter.svg"
          />{' '}
          <a
            target="_blank"
            href="https://twitter.com/henryhoffman"
            rel="noreferrer"
          >
            @henryhoffman
          </a>
        </Byline>
      </BoxQuote>

      <Box color="#142A4A" contrastColor="var(--white)">
        <H2>Unlock for Developers</H2>
        <p>
          Unlock’s open source, blockchain-based protocol allows you to
          integrate and build any kind of membership application. Built-in
          Stripe support allows you to accept crypto and credit cards.{' '}
        </p>
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

      <Box color="var(--white)" style={{ textAlign: 'center' }}>
        <H2>Join the community</H2>
        <ActionButtons style={{ justifyContent: 'center', marginTop: '32px' }}>
          <ActionButton
            target="_blank"
            href="https://discord.gg/Ah6ZEJyTDp"
            color="#5865F2"
            contrastColor="var(--white)"
          >
            <Icon size="36">
              <Svg.Discord />
            </Icon>
            Discord
          </ActionButton>
          <ActionButton
            target="_blank"
            href="https://unlock.community/"
            color="#4A4A4A"
            contrastColor="var(--white)"
          >
            <Icon size="36">
              <Svg.Discourse />
            </Icon>
            Forum
          </ActionButton>
          <ActionButton
            target="_blank"
            href="https://twitter.com/unlockprotocol"
            color="#1DA1F2"
            contrastColor="var(--white)"
          >
            <Icon size="36">
              <Svg.Twitter />
            </Icon>
            Twitter
          </ActionButton>
          <ActionButton
            target="_blank"
            href="https://vote.unlock-protocol.com/#/unlock-protocol.eth"
            color="var(--brand)"
            contrastColor="var(--white)"
          >
            <Icon size="36">
              <Svg.Key />
            </Icon>
            Governance
          </ActionButton>
        </ActionButtons>
      </Box>

      <Box color="transparent">
        <H3>Latest News</H3>
        <Columns>
          {posts.map((story) => {
            return (
              <Column
                key={story.slug}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: 'var(--white)',
                  borderRadius: '4px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Illustration
                    style={{ maxHeight: '170px' }}
                    src={story.image}
                  />
                </div>
                <h4 style={{ marginBottom: '4px' }}>{story.title}</h4>
                <p
                  style={{
                    marginTop: '4px',
                    textAlign: 'left',
                    fontSize: '16px',
                    maxHeight: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {story.description.slice(0, 160)}...{' '}
                  <Link href={`/blog/${story.slug}`}>
                    <a>Read more</a>
                  </Link>
                </p>
              </Column>
            )
          })}
        </Columns>
      </Box>

      <Box color="var(--link)" contrastColor="var(--white)">
        <H2>Sign Up for Updates</H2>
        <p>
          We&apos;ll send you fresh news about our platform, including new
          features and opportunities for the community.
        </p>
        <OptInForm />
      </Box>
    </Layout>
  )
}

HomeContent.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

export default HomeContent
const Illustration = styled.img`
  max-width: 100%;
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
const RotatingWords = styled.div`
  display: inline;
  text-indent: 10px;

  @keyframes rotateWordsFirst {
    0% {
      opacity: 0;
      animation-timing-function: ease-in;
    }
    8% {
      opacity: 1;
    }
    19% {
      opacity: 1;
    }
    25% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  span {
    animation: rotateWordsFirst 10s linear infinite 0s;
  }

  span:nth-child(1) {
    animation-delay: 0s;
  }
  span:nth-child(2) {
    animation-delay: 2s;
  }
  span:nth-child(3) {
    animation-delay: 4s;
  }
  span:nth-child(4) {
    animation-delay: 6s;
  }
  span:nth-child(5) {
    animation-delay: 8s;
  }
`

const Word = styled.span`
  position: absolute;
  opacity: 0;
  overflow: hidden;
`
