import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'

interface BuildReceiptEmailParamsProps {
  content: string
  hash: string
  lockAddress: string
  network: number
  subject: string
  unlockApp: string
}

export const buildReceiptEmailParams = async ({
  content,
  hash,
  lockAddress,
  network,
  subject,
  unlockApp,
}: BuildReceiptEmailParamsProps) => {
  const receiptUrl = new URL('/receipts', unlockApp)
  receiptUrl.searchParams.set('address', lockAddress)
  receiptUrl.searchParams.set('network', network.toString())
  receiptUrl.searchParams.append('hash', hash)

  const keychainUrl = new URL('/keychain', unlockApp)
  const htmlContent = await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(content)

  return {
    content: String(htmlContent?.value),
    keychainUrl: keychainUrl.toString(),
    lockAddress,
    network: network.toString(),
    receiptUrl: receiptUrl.toString(),
    subject,
  }
}
