import { NextSeo } from 'next-seo'
import { useSearchParams } from 'next/navigation'
import { ReactNode } from 'react'
import { config } from '~/config/app'

interface Props {
  children?: ReactNode
}

export function Container({ children }: Props) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  return (
    <>
      <NextSeo
        title="Checkout"
        description="Purchase a membership"
        openGraph={{
          images: [
            {
              alt: 'Checkout',
              url: `${config.unlockApp}/og/checkout?id=${id}`,
            },
          ],
        }}
        additionalMetaTags={[
          {
            property: 'fc:frame',
            content: 'vNext',
          },
          {
            name: 'fc:frame:image',
            content: `${config.unlockApp}/frames/checkout?id=${id}`,
          },
          {
            name: 'fc:frame:button:1',
            content: 'Purchase a key',
          },
          {
            name: 'fc:frame:button:1:target',
            content: `${config.unlockApp}/frames/checkout/txdata`,
          },
          {
            name: 'fc:frame:button:1:action',
            content: 'tx',
          },
          {
            name: 'fc:frame:button:1:post_url',
            content: `${config.unlockApp}/frames/checkout?success=true`,
          },
        ]}
      />
      <div className="flex flex-col items-center justify-center min-w-full min-h-screen p-3 overflow-auto bg-gray-300 bg-opacity-75 backdrop-filter backdrop-blur-sm">
        {children}
      </div>
    </>
  )
}
