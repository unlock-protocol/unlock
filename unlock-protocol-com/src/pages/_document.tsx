import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="alternate"
          href="blog.xml"
          type="application/atom+xml"
          title="Blog Atom Feed"
        />
        <link
          rel="alternate"
          href="blog.xml"
          type="application/rss+xml"
          title="Blog RSS Feed"
        />
        <link
          rel="alternate"
          href="blog.json"
          type="application/json"
          title="Blog JSON feed"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
