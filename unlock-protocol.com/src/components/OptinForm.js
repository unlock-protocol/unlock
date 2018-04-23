import React from 'react'
import Link from 'gatsby-link'

const OptinForm = () => (
  <div>
    <form id="subForm" action="/" className="subscribe js-cm-form" action="https://www.createsend.com/t/subscribeerror?description=" method="post" data-id="A61C50BEC994754B1D79C5819EC1255C24DC9BD24F2D62D9FE1BE9C2DC3506D10407F5BF6B525B95AC41E626C05091706888A584548167E6B31CDBA36E66DB9D">
      <input id="fieldEmail" name="cm-skyhlr-skyhlr" type="email" className="subscribe__input js-cm-email-input" placeholder="Subscribe to be notified when we launch" required />
      <input type="submit" className="subscribe__button js-cm-submit-button" value="" />
    </form>
    <script type="text/javascript" src="https://js.createsend1.com/javascript/copypastesubscribeformlogic.js"></script>
  </div>
)

export default OptinForm
