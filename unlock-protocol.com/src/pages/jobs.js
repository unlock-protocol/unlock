

import React from 'react'
import Link from 'gatsby-link'

import Button from '../components/Button'
import Column from '../components/Column'
import Columns from '../components/Columns'
import OptinForm from '../components/OptinForm'

const JobsPage = () => (
  <section className="page__right">
    <div className="page__description">
      <h1 className="h">Work at Unlock</h1>
      <p>Unlock is an <i>access control protocol</i> built on Ethereum. We enable creators to monetize their content or software without relying on a middleman. We are looking for software engineers to help us build the protocol, its reference applications (ÐApps), as well as learn and pave the way for best practices around blockchain development.</p>

      <h3 className="h h--alt">Open Positions</h3>
      <ul>
        <li><a href="#senior-frontend-engineer">Senior Frontend Engineer</a></li>
      </ul>
      <h2 className="h">About Unlock</h2>
      <p>At Unlock, we believe the web needs a <a href="https://medium.com/unlock-protocol/its-time-to-unlock-the-web-b98e9b94add1">new business model</a>. We believe the decentralization promise of the web cannot be achieved if economic incentives are not aligned between consumers and creators. For this, we're building a protocol which lets anyone restrict access to their creations and for consumers to earn points when they discover and promote the best creations.
      </p>
      <p>
        The Unlock Protocol can be applied to publishing (paywalls), newsletters, software licenses or even the physical world, such as transportation systems. The web revolutionized all of these areas, Unlock will make them economically viable.
      </p>
      <p>
       We know that diversity of background, experiences and perspective is the only way to understand and cater the very wide network of applications that we envision for the protocol. As such, Unlock Inc. is proud to be an Equal Opportunity Employer that is committed to inclusion and diversity. We do not discriminate on the basis of race, religion, color, national origin, gender, sexual orientation, age, marital status, veteran status, or disability status.
      </p>
      <p>
        All of our employees have an impact on the products and applications we're building, but also on the organization itself. We focus on growth and personal development for everyone and we know that this can only happen when employees have piece of mind. We care about our employees both at work and in their personal lives with core benefits such as health insurance, paid time off and perks that encourage continuous learning and cultivation of mind and body.
      </p>

      <h2 className="h">Interview Process</h2>
      <p>We think that an explicit process will let us evaluate your skills in the most fair way, as well as will let you prepare adequately.</p>
      <ol>
        <li>Initial chat conversation with our founder Julien (find him in our <a href="https://t.me/unlockprotocol">Telegram group</a>!).</li>
        <li>Open Source Bounty assignment: all of <a href="https://github.com/unlock-protocol/unlock">Unlock's code is public</a>. We'll ask you to submit a pull request for one of the issues which has a bounty.</li>
        <li>Once your Pull Request has been merged, we'll invite you for a second round of interviews (expect 3 or 4) with the team.</li>
        <li>Reference checks (please have your resumé ready and updated too!)</li>
      </ol>
      <p>We thrive to be respectful of your time and effort by providing you feedback early and often.</p>

      <h1 className="h" id="senior-frontend-engineer">Senior Frontend Engineer</h1>
      <p><code>New York</code>&nbsp;&mdash;&nbsp;<code>Engineering</code>&nbsp;&mdash;&nbsp;<code>Full Time</code></p>
      <h2 className="h">About You</h2>

      <p>Do you think that the web's <a href="https://www.theatlantic.com/technology/archive/2014/08/advertising-is-the-internets-original-sin/376041/">original sin</a> is its lack of business model? Do you think that individuals, democracies and the web, deserve better than click-bait, information overload or fake news? <br />
      Are you excited about empowering creators by building the tools and interfaces which will let them monetize their creations without gate keepers? <br />
      Do you want to learn and share your experiences with a team of skillful and curious colleagues? <br />
      You should consider joining the Unlock team on our journey.</p>

      <h2 className="h">About The Role</h2>

      <p>
        By joining Unlock, you're working with experienced engineers, open web advocates and <a href="https://www.linkedin.com/in/juliengenestoux">entrepreneurs</a> who founded successful companies with significant exits. Unlock will soon become the default business model for the web and you should expect your code and designs to be used by hundreds of millions of users, all over the world.
      </p>

      <p>We value positive energy, curiosity and constant learning, so you should expect this job description to be slightly outdated after a couple months, but at first, we believe you'll help us with:
      </p>
      <ul>
        <li>Tools for creators: You will be in charge of building a comprehensive yet simple interface to empower creators and let them create the locks they need.</li>
        <li>Checkout UX: Unlock will provide the <i>best paywall you've ever used</i>. It needs to be smooth and elegant.</li>
        <li>Front end architecture: Both of the goals above will be served by a robust and maintainable architecture. Your job includes making informed decisions based on these goals as well as implement the foundation for frequent iterations.</li>
      </ul>

      <p>Candidates for this position should have a solid background in front end technologies like React, Redux and the whole JavaScript stack. Previous experience in open source development and a strong interest in crypto / decentralization is a plus.</p>

      <h2 className="h">Requirements</h2>
      <ul>
        <li>4+ years of experience in software engineering</li>
        <li>Deep working knowledge/expertise with modern JS applications and frameworks (React, Redux, SASS...) </li>
        <li>Advanced knowledge of the web stack and standards (ES6, PWA...)</li>
        <li>You ship high quality, well tested and documented code to meet the needs of users customers and colleagues</li>
        <li>High degree of autonomy and extensive communication skills to ensure that efficient collaboration with other team members</li>
        <li>Be a steward and influencer of our early engineering culture</li>
        <li>In NYC or willing to relocate</li>
        </ul>
      <h2 className="h">Great to have</h2>
      <ul>
        <li>Experience working on open source projects</li>
        <li>Passion of cryptography and cyber security</li>
        <li>Interest for user experience and visual arts</li>
      </ul>
      <h3 className="h">Compensation : $110K – $140K, stock options</h3>
      <h2 className="h h--alt">Applications</h2>
      <p>If you are interested in applying for this position, please send an email containing your resume, Github, and Linkedin to <a href="mailto:julien@unlock-protocol.com">julien@unlock-protocol.com</a>, and reach out to Julien in our <a href="https://t.me/unlockprotocol">Telegram group</a>!).</p>

      {/* <h1 className="h" id="solidity-engineer">Solitidy Engineer</h1>
      <p><code>New York</code>&nbsp;&mdash;&nbsp;<code>Engineering</code>&nbsp;&mdash;&nbsp;<code>Full Time</code></p>
      <h2 className="h">About You</h2>
      <h2 className="h">About The Role</h2>
      <h2 className="h">Requirements</h2>
      <h2 className="h">Great to have</h2>
      <ul>
        <li>Experience working on open source projects</li>
      </ul>
      <h2 className="h h--alt">Applications</h2>
      <p>If you are interested in applying for this position, please send an email containing your resume, Github, and Linkedin to julien@unlock-protocol.com.</p> */}

    </div>
  </section>
)

export default JobsPage
