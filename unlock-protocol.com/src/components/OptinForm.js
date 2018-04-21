import React from 'react'
import Link from 'gatsby-link'

const OptinForm = () => (
  <form action="/" className="subscribe">
    <input type="email" className="subscribe__input" placeholder="Subscribe to be notified when we launch" />
    <input type="submit" className="subscribe__button" value="" />
  </form>
)

export default OptinForm
