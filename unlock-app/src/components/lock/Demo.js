import UnlockPropTypes from '../../propTypes'

import React, { Component } from 'react'
import Layout from '../interface/Layout'
import { Section, Title, Headline, ShortColumn, Paragraph } from '../pages/Components'

export class Demo extends Component {
  render() {
    return (
      <Layout title="Unlock Demo Page">
        <Section>
          <Title>It’s Time to Unlock The Web</Title>
          <Headline>
            The web needs a better business model — and we believe the technology is finally here to do it.
          </Headline>
          <ShortColumn>
            <Paragraph>
              It’s become dangerously clear in the last few years that the business model we thought would support a vibrant, open web just isn’t going to work any more. Driving more and more eyeballs to ads was always considered ethically and morally borderline, but today, monetizing clickbait isn’t just economically fragile: it’s feeding our democracies with more misinformation and fake news.
            </Paragraph>
            <Paragraph>
              The thing is, plenty of publishers and creators have been ahead of the curve on this one, even if we don’t give them much credit for it. They knew that free content can, in fact, be very costly and that real freedom comes from knowledge that’s expensive to produce. They understood that when Stewart Brand famously said that “information wants to be free” he meant free as in “speech” (libre), not free as in “beer” (gratis).
            </Paragraph>

          </ShortColumn>
        </Section>
      </Layout>
    )
  }
}

Demo.propTypes = {
  address: UnlockPropTypes.address,
}

export default Demo
