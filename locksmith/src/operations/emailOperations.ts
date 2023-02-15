import { CustomEmailContent } from '../models/customEmailContent'

interface CustomEmailProps {
  lockAddress: string
  network: number
  template: string
}

export async function getCustomTemplateContent({
  lockAddress,
  network,
  template,
}: CustomEmailProps) {
  const customEmail = await CustomEmailContent.findOne({
    where: {
      lockAddress,
      network,
      template: template?.toUpperCase(),
    },
  })

  return customEmail || undefined
}
