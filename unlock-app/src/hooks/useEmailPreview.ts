import { useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { locksmith } from '~/config/locksmith'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import { unified } from 'unified'

export const useCustomContentForEmail = ({
  network,
  lockAddress,
  templateId,
}: {
  network: number
  lockAddress: string
  templateId: string
}) => {
  return useQuery({
    queryKey: ['getCustomContent', network, lockAddress, templateId],
    queryFn: async () => {
      const response = await locksmith.getCustomEmailContent(
        network,
        lockAddress,
        templateId
      )
      return response.data.content
    },
  })
}

export const useEmailPreview = ({
  params,
  templateId,
}: {
  params: any
  templateId: string
}) => {
  return useQuery({
    queryKey: ['getEmailPreview', templateId, params],
    queryFn: async () => {
      const url = new URL(
        `${config.services.wedlocks.host}/preview/${templateId}`
      )

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            url.searchParams.append(key, value.toString())
          }
        })
      }

      return (
        await fetch(url, {
          headers: {
            accept: 'application/json',
          },
        })
      ).json()
    },
    enabled: !!templateId && !!params,
  })
}

/**
 * Compute params for the email template preview
 * @returns
 */
export const useEmailPreviewDataForLock = ({
  lockAddress,
  network,
  customContent,
}: {
  network: number
  lockAddress: string
  customContent?: string
}) => {
  return useQuery({
    queryKey: [
      'useEmailPreviewDataForLock',
      lockAddress,
      network,
      customContent,
    ],
    queryFn: async () => {
      const lockImage = `${config.locksmithHost}/lock/${lockAddress}/icon`
      const customContentHtml: string = await markdownToHtml(
        customContent || ''
      )
      const { data: eventDetails } = await locksmith.getEventDetails(
        network,
        lockAddress
      )

      // Fetch lock metadata to get the lock name
      const { data: lockMetadata } = await locksmith.lockMetadata(
        network,
        lockAddress
      )

      const params = {
        keychainUrl: `${config.unlockApp}/keychain`,
        network,
        lockImage,
        lockName: lockMetadata?.name,
        customContent: customContentHtml,
        ...eventDetails,
        // certificate details
        certificationDetail: '{Certification details}',
        certificationUrl: `${config.unlockApp}/certification/${network}/${lockAddress}/#`,
        isUserAddress: true,
      }

      return params
    },
    enabled: !!lockAddress && !!network,
  })
}

// parse markdown to HTML
const markdownToHtml = async (content: string) => {
  try {
    const parsedContent = await unified()
      .use(remarkParse as any)
      .use(remarkHtml as any, {
        sanitize: true,
      })
      .process(content || '')

    return parsedContent?.value?.toString()
  } catch (err: any) {
    console.error(err)
    return ''
  }
}
