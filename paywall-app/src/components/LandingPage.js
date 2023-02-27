import React from 'react'
import styled from 'styled-components'
import Layout from './interface/Layout'
import KeyText from './interface/svg/KeyText'
import Media from '../theme/media'

export default function LandingPage() {
  return (
    <Layout title="Paywall" forContent>
      <section>
        <Title>Pay for Content Seamlessly</Title>
        <SubTitle>
          Unlock enables anyone with a crypto wallet to seamlessly buy and
          manage access to any kind of content.
        </SubTitle>
      </section>
      <Content>
        <KeyGraphic height="245px" width="200px" />
        <p>
          At Unlock, we believe that the more accessible paid content is the
          better it will be. To do that we’re making it easy for readers like
          you to seamlessly pay for and manage your content.
        </p>
        <p>
          If you want to know more about Unlock’s decentralized payment protocol
          check out our blog.
        </p>
      </Content>
      <section>
        <Divider>FAQ</Divider>
        <Question>How do I get a wallet?</Question>
        <Answer>
          You need a web3 enabled wallet such as MetaMask for Chrome or Opera
          for Android.
        </Answer>
        <Question>What does it cost to use Unlock?</Question>
        <Answer>
          Unlock is free to use though you will have to pay a small transaction
          fee when purchasing your content. It’s usually just a few cents on top
          of your purchase.
        </Answer>
        <Question>What about privacy?</Question>
        <Answer>
          Unlock does not collect any personal information. Like all
          transactions on the the Ethereum blockchain, details about Unlock
          transactions are captured in its ledger in an anonymous form.
        </Answer>
      </section>
      <section>
        <Divider />
        <Footer>
          Check out our open source code on{' '}
          <a href="https://github.com/unlock-protocol/unlock">GitHub</a>, come{' '}
          <a href="https://unlock-protocol.com/jobs">work with us</a> or simply{' '}
          <a href="mailto:hello@unlock-protocol.com">get in touch</a>.
        </Footer>
      </section>
    </Layout>
  )
}

const Title = styled.h1`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 36px;
  font-style: light;
  line-height: 47px;
  grid-column: 1 3;
  color: var(--darkgrey);
`

const SubTitle = styled.h2`
  font-family: IBM Plex Serif;
  font-style: normal;
  font-weight: 300;
  font-size: 32px;
  line-height: 42px;
  grid-column: 1 / span 3;
  color: var(--darkgrey);
`

const Content = styled.div`
  p {
    font-family: IBM Plex Serif;
    font-style: normal;
    font-weight: 300;
    font-size: 24px;
    line-height: normal;
  }
  ${Media.phone`
    display: flex;
    flex-direction: column;
  `}
`

const KeyGraphic = styled(KeyText)`
  margin-top: -45px;
  float: right;
  ${Media.phone`
    margin-top: initial;
    float: unset;
    align-self: center;
  `};
`

const Divider = styled(Title)`
  border-top: solid 3px var(--silver);
  width: 88px;
`

const Question = styled.dl`
  font-family: IBM Plex Serif;
  font-style: normal;
  font-weight: 300;
  font-size: 24px;
  line-height: normal;
`

const Answer = styled.dt`
  font-family: IBM Plex Serif;
  font-style: normal;
  font-weight: 300;
  font-size: 16px;
  line-height: 22px;
`

const Footer = styled.div`
  font-family: IBM Plex Serif;
  font-style: normal;
  font-weight: 300;
  font-size: 24px;
  line-height: normal;
`
