import { useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { storage } from '~/config/storage'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'

export const useEmailPreview = ({
  network,
  lockAddress,
  templateId,
}: {
  network: number
  lockAddress: string
  templateId: string
}) => {
  const {
    data: customContent,
    refetch: refetchGetCustomContent,
    isLoading: isLoadingCustomContent,
  } = useQuery(
    ['getCustomContent', network, lockAddress, templateId],
    async () => {
      const response = await storage.getCustomEmailContent(
        network,
        lockAddress,
        templateId
      )
      return response.data.content
    }
  )

  const {
    data: email,
    refetch: refetchEmailPreview,
    isLoading: isLoadingEmailPreview,
  } = useQuery(
    ['getEmailPreview', network, lockAddress, templateId, customContent],
    async () => {
      const url = new URL(
        `${config.services.wedlocks.host}/preview/${templateId}`
      )

      const params = await emailPreviewData({
        network,
        lockAddress,
        customContent: customContent || '',
      })
      Object.entries(params).map(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value.toString())
        }
      })

      return (
        await fetch(url, {
          headers: {
            accept: 'application/json',
          },
        })
      ).json()
    },
    {
      enabled: !!customContent,
    }
  )

  return {
    refetch: async () => {
      await refetchGetCustomContent(), await refetchEmailPreview
    },
    isLoading: isLoadingEmailPreview || isLoadingCustomContent,
    customContent,
    email,
  }
}

/**
 * Compute params for the email template preview
 * @returns
 */
export const emailPreviewData = async ({
  lockAddress,
  network,
  customContent,
}: {
  network: number
  lockAddress: string
  customContent: string
}) => {
  const lockImage = `${config.locksmithHost}/lock/${lockAddress}/icon`
  const customContentHtml: string = await markdownToHtml(customContent || '')
  const { data: eventDetails } = await storage.getEventDetails(
    network,
    lockAddress
  )

  const params = {
    keychainUrl: `${config.unlockApp}/keychain`,
    keyId: 5, // Placeholder!
    network,
    lockImage,
    customContent: customContentHtml,
    ...eventDetails,
    // certificate details
    certificationDetail: '{Certification details}',
  }

  return params
}

// parse markdown to HTML
const markdownToHtml = async (content: string) => {
  try {
    const parsedContent = await unified()
      .use(remarkParse)
      .use(remarkHtml, {
        sanitize: true,
      })
      .process(content || '')

    return parsedContent?.value?.toString()
  } catch (err: any) {
    console.error(err)
    return ''
  }
}
