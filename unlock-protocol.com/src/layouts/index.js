import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import 'normalize.css'

import Header from '../components/Header'
import Footer from '../components/Footer'
import './../assets/scss/index.scss'

const Layout = ({ children, data }) => (
  <div className="page">
    <Helmet>
      <title>{data.site.siteMetadata.title}</title>
      <script src='https://www.google.com/recaptcha/api.js'></script>
    </Helmet>
    <Header siteTitle={data.site.siteMetadata.title} />
    <section className="page__right">
      {children()}
      <Footer />
    </section>
  </div>
)

Layout.propTypes = {
  children: PropTypes.func,
}

export default Layout

export const query = graphql`
  query SiteTitleQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
