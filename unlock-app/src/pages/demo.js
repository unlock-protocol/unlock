import { connect } from 'react-redux'
import styled from 'styled-components'

import React from 'react'
import NoSSR from 'react-no-ssr'
import Head from 'next/head'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import { Overlay } from '../components/lock/Overlay'
import { Section, Title, Headline, ShortColumn, Paragraph } from '../components/Components'
import withConfig from '../utils/withConfig'
import ShowUnlessUserHasKeyToAnyLock from '../components/lock/ShowUnlessUserHasKeyToAnyLock'
import { pageTitle } from '../constants'

export class Demo extends React.Component {
  static async getInitialProps({ req, query: { lockTransaction } }) {

    // passing :lockTransaction query to the component as a prop
    return { lockTransaction: lockTransaction }
  }

  render() {
    const { lockTransaction, locks } = this.props
    const lock = Object.values(locks).find((lock) => lock.transaction === lockTransaction)
    return(
      <Layout title="Unlock Demo Page" forContent>
        <Head>
          <title>{pageTitle('Demo')}</title>
        </Head>
        <NoSSR>
          <Section>
            <Title>It’s Time to Unlock The Web</Title>
            <Headline>
              The web needs a better business model — and we believe the technology is finally here to do it.
            </Headline>
            <ShortColumn>
              <Paragraph>
                It’s become dangerously clear in the last few years that the business model we thought would support a vibrant, open web just isn’t going to work any more. Driving more and more eyeballs to ads was always considered ethically and morally borderline, but today, monetizing clickbait isn’t just economically fragile: it’s feeding our democracies with more misinformation and fake news.
              </Paragraph>
              <Paragraph>
                The thing is, plenty of publishers and creators have been ahead of the curve on this one, even if we don’t give them much credit for it. They knew that free content can, in fact, be very costly and that real freedom comes from knowledge that’s expensive to produce. They understood that when Stewart Brand famously said that “information wants to be free” he meant free as in “speech” (libre), not free as in “beer” (gratis).
              </Paragraph>

              <BottomSticker>
                You can only read this message if you own a key to the lock at
                {' '}
                {lockTransaction}
.
              </BottomSticker>

              <ShowUnlessUserHasKeyToAnyLock locks={[lock]}>
                <Overlay locks={[lock]} />
              </ShowUnlessUserHasKeyToAnyLock>

            </ShortColumn>
          </Section>
        </NoSSR>
      </Layout>
    )
  }
}

Demo.propTypes = {
  locks: UnlockPropTypes.locks,
  lockTransaction: UnlockPropTypes.address,
}

const mapStateToProps = state => {
  // What if there is no address in the path? and/or the lock is missing from state?
  return {
    locks: state.locks,
  }
}

export default withConfig(connect(mapStateToProps)(Demo))

const BottomSticker = styled.p`
  overflow-wrap: break-word;
  word-break: break-all;
  background-color: var(--lightgrey);
  padding: 10px 30px;
`
