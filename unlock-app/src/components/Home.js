import React from 'react'
import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div>
      <header className="masthead mb-auto">
        <div className="inner">
          <h3 className="masthead-brand">&nbsp;</h3>
          <nav className="nav nav-masthead justify-content-center">
          </nav>
        </div>
      </header>
      <div className="jumbotron">
        <h1 className="display-4">Unlock</h1>
        <p className="lead">Unlock is an access control protocol built on a blockchain.
        </p>
        <hr className="my-4" />
        <p>It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.</p>
        <p className="lead">
          <Link className="btn btn-primary btn-lg" href="#" role="button" to={'/creator'}>
            Create your lock
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Home
