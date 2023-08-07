import React, { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import Loading from '../interface/Loading'
import { ConfigContext } from '../../utils/withConfig'

declare const window: any
const usePaywall = () => {
  const config = useContext(ConfigContext)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const unlock = () => {
    window?.unlockProtocol?.loadCheckoutModal(
      window.unlockProtocolConfig,
      window.location.origin
    )
  }

  useEffect(() => {
    const url = new window.URL(window.location.href)

    if (!url.searchParams.get('lock')) {
      setError('Missing lock param!')
      setLoading(false)
      return
    }

    // Set config
    const useMetadataInputs = url.searchParams.get('metadataInputs') === 'true'
    const referrer = url.searchParams.get('referrer')

    window.unlockProtocolConfig = {
      persistentCheckout: false,
      metadataInputs: useMetadataInputs
        ? [
            {
              name: 'First Name',
              type: 'text',
              required: true,
              public: true,
            },
            {
              name: 'Last Name',
              type: 'text',
              required: true,
            },
          ]
        : undefined,
      locks: {
        [url.searchParams.get('lock')]: {
          network: parseInt(url.searchParams.get('network'), 10),
          emailRequired: true,
        },
      },
      referrer,
      // TODO: remove, part of the old checkout config
      callToAction: {
        default: 'This content is locked. You need to unlock it!',
        expired:
          'Your previous membership has now expired. You need to renew it.',
        pending:
          'Thanks for your trust. The transaction is now being processed.',
        confirmed: 'Thanks for being a member!',
        metadata:
          'We need to collect some additional information for your purchase.',
        noWallet:
          'You need to use a crypto-wallet in order to unlock this content.',
      },
    }

    // Remove localStorage (on the demo we do not want to store any account)
    localStorage.removeItem('userInfo')

    // Event handler
    const handler = window.addEventListener(
      'unlockProtocol.status',
      (e: any) => {
        if (e?.detail?.state === 'unlocked') {
          setLocked(false)
        } else {
          setLocked(true)
        }
      }
    )

    // Load unlock script
    const script = document.createElement('script')
    script.src = `${config.paywallUrl}/static/unlock.latest.min.js`
    script.async = true
    document.body.appendChild(script)

    setLocked(true)
    setLoading(false)

    return () => {
      // Remove the script!
      script.remove()
      window.removeEventListener('unlockProtocol', handler)
    }
  }, [config])
  return { loading, locked, error, unlock }
}

export const DemoContent = () => {
  const { locked, loading, error, unlock } = usePaywall()

  return (
    <div>
      <Fonts />
      <Head>
        <title>Unlock Demo Example - Unlock Times</title>
      </Head>
      <div className="flex min-w-[500] max-w-[800px] mx-auto font-[SourceSerifPro]">
        <div className="mx-auto">
          <h1 className="text-4xl font-bold text-gray-600 font-[UnifrakturCook] mb-12">
            Unlock Times
          </h1>
          <div>
            <div className="block w-20 h-1 mb-5 bg-gray-300"></div>
            <h1 className="block mb-10 text-4xl font-bold text-gray-600">
              Demoing the Unlock Paywall
            </h1>
            <span className="block mb-8 text-4xl leading-10 text-gray-600">
              Unlock Times shows off its new subscription paywall that’s easy to
              use and streamlined for readers and publishers.{' '}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-10">
              {error && <p>{error}</p>}
              {loading && <Loading />}
              {!loading && !error && (
                <div className="text-lg text-gray-600">
                  <p>
                    It’s become dangerously clear in the last few years that the
                    business model we thought would support a vibrant, open web
                    just isn’t going to work any more. Driving more and more
                    eyeballs to ads was always considered ethically and morally
                    borderline, but today, monetizing clickbait isn’t just
                    economically fragile: it’s feeding our democracies with more
                    misinformation and fake news.
                  </p>

                  <div className="relative block">
                    The thing is, plenty of publishers and creators have been
                    ahead of the curve on this one, even if we don’t give them
                    much credit for it. They knew that free content can, in
                    fact, be very costly and that real freedom comes from
                    knowledge that’s expensive to produce. They understood that
                    when Stewart Brand famously said that “information wants to
                    be free” he meant free as in “speech” (libre), not free as
                    in “beer” (gratis).
                    <div
                      style={{
                        background:
                          'linear-gradient(rgba(253, 250, 247, 0), rgb(250, 250, 250) 70%)',
                      }}
                      className={`absolute top-0 w-full h-full ${
                        locked ? 'block' : 'hidden'
                      }`}
                    />
                  </div>

                  <div
                    className={`text-xl text-center mt-5 ${
                      locked ? 'block' : 'hidden'
                    } `}
                  >
                    Support our work and read the rest of this article by
                    becoming a member today!
                    <div className="flex justify-center w-full mt-4">
                      <button
                        onClick={unlock}
                        className="px-12 py-3 text-2xl tracking-wide border-[3px] border-gray-300"
                      >
                        Join us
                      </button>
                    </div>
                  </div>

                  <div className={`relative ${locked ? 'hidden' : 'block'}`}>
                    Some publishers, like the New York Times, got a lot of heat
                    when they introduced their paywall, but the trend they set
                    isn’t reversing: they now have 3M subscribers and aim for
                    10M by 2020. Hundreds of other news and content
                    organizations are going in the same direction, including
                    this very platform.
                  </div>
                  <div className={`relative ${locked ? 'hidden' : 'block'}`}>
                    Another trend emerged in the last 10 years: ownership does
                    not seem to matter as much as it used to. People are getting
                    rid of their meticulously amassed records and DVD
                    collections to replace them with monthly subscriptions to
                    Spotify and Netflix. Ride sharing platforms have put yet
                    another dent in the car ownership status symbol… etc. My
                    generation is putting access above ownership.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoContent

const Fonts = () => (
  <link
    href="https://fonts.googleapis.com/css?family=Source+Serif+Pro:400,700|UnifrakturCook:700"
    rel="stylesheet"
  />
)
