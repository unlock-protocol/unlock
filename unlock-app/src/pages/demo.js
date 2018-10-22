import { connect } from 'react-redux'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import NoSSR from 'react-no-ssr'
import Layout from '../components/interface/Layout'
import { Overlay } from '../components/lock/Overlay'
import { Section, Title, Headline, ShortColumn, Paragraph } from '../components/Components'

export class Demo extends React.Component {
  static async getInitialProps({ req, query: { lockaddress } }) {

    // passing :lockaddress query to the component as a prop
    return { lockAddress: lockaddress }
  }

  render() {
    const { lockAddress, locks } = this.props
    const lock = Object.values(locks).find((lock) => lock.address === lockAddress)

    return(
      <Layout title="Unlock Demo Page">
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
              <Overlay locks={[lock]} />

            </ShortColumn>
          </Section>
        </NoSSR>
      </Layout>
    )
  } 
}

Demo.propTypes = {
  locks: UnlockPropTypes.locks,
  lockAddress: UnlockPropTypes.address,
}

const mapStateToProps = state => {
  // What if there is no address in the path? and/or the lock is missing from state?
  return {
    locks: state.locks,
  }
}

export default connect(mapStateToProps)(Demo)
