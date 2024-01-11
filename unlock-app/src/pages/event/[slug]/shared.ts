import { toFormData } from '~/components/interface/locks/metadata/utils'
import { storage } from '~/config/storage'

export interface ServerSidePropsParams {
  params: {
    slug: string
  }
}

export const getServerSidePropsForEventPage = async ({
  params,
}: ServerSidePropsParams) => {
  const { data: eventMetadata } = await storage.getEvent(params.slug)
  return {
    props: {
      event: {
        ...toFormData({
          ...eventMetadata.data!,
          slug: eventMetadata.slug,
        }),
      },
      checkoutConfig: eventMetadata.checkoutConfig,
    },
  }
}
